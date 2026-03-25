import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def extract_images(url:str):

    headers = {
        "User-Agent": "mozilla/5.0"
    }

    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")
    
    image_urls = set()

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
        
        # ゴミ画像除外
        if is_valid_image(full_url):
            image_urls.add(full_url)
   
    return list(image_urls)

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
    if not any(ext in url.lower() for ext in [".jpg", ".jpeg", ".png",".webp", ".svg" ]):
        return False

     
    
    return True