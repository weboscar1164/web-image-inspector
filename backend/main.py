from fastapi import FastAPI
from pydantic import BaseModel
from parser import extract_images

app = FastAPI()

class UrlRequest(BaseModel):
    url:str



@app.post("/analyze")
def analyze_images(data: UrlRequest):
    print("API HIT")
    images = extract_images(data.url)

    return {
        "count": len(images),
        "images":images
    }