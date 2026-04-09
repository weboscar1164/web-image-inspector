from fastapi import FastAPI
from pydantic import BaseModel
from parser import extract_images
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

class UrlRequest(BaseModel):
    url:str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/analyze")
def analyze_images(data: UrlRequest):
    print("API HIT")
    images = extract_images(data.url)

    return {
        "count": len(images),
        "images":images
    }