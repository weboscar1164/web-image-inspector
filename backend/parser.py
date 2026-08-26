import requests
import os
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from urllib.parse import urlparse

def extract_images(url:str):

    headers = {
        "User-Agent": "mozilla/5.0"
    }

    response = requests.get(url, headers=headers)
    html = response.content
    soup = BeautifulSoup(html, "html.parser")

    if response.status_code != 200:
        return {"count":0, "images":[]}
    
    
    image_urls = set()
    images = []

    for img in soup.find_all("img"):

        # 優先順位で取得    
        src = (
            img.get("src")
            or img.get("data-src")
            or img.get("data-lazy")
            or img.get("data-original")
        )

        if not src:
            continue

        if "srcset" in img.attrs:
            srcset = img.get("srcset")
            if srcset:
                src = srcset.split(",")[0].split(" ")[0]
            
        # 絶対URL化
        full_url = urljoin(url, src)

        # 重複除去
        if full_url in image_urls:
            continue

        width = img.get("width")
        height = img.get("height")

        if width and height:
            if int(width) < 100 or int(height) < 100:
             continue
        
        # ゴミ画像除外
        if is_valid_image(full_url):
            image_urls.add(full_url)

            images.append({
                "src": full_url,
                "alt": img.get("alt") or "",
                "width": img.get("width"),
                "height": img.get("height"),
                "type": get_image_type(full_url)
            })

    return {
        "count": len(images),
        "images": images
    }

def is_valid_image(url: str):

    # よくあるゴミを除去
    NG_KEYWORDS = [
        "icon",
        "logo",
        "sprite",
        "blank",
        "spacer",
        "ads",
    ]

    if any(k in url.lower() for k in NG_KEYWORDS):
        return False
    
    # 拡張子チェック（簡易）
    if not any(ext in url.lower() for ext in [".jpg", ".jpeg", ".png",".webp",".gif",".svg",".avif" ]):
        return False

    return True

def get_image_type(url:str) -> str:
    path = urlparse(url).path
    ext = os.path.splitext(path)[1].lower()

    ext_map = {
        ".jpg":"jpg",
        ".jpeg":"jpeg",
        ".png":"png",
        ".webp":"webp",
        ".gif":"gif",
        ".svg":"svg",
        ".avif":"avif",
    }

    
    return ext_map.get(ext, "unknown")
