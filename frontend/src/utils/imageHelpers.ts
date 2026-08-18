import type { ImageData } from "../Types";

export const isVertical = (img: ImageData) => img.height > img.width;

export const isHorizontal = (img: ImageData) => img.width > img.height;

export const isSquare = (Img: ImageData) => Img.width === Img.height;

export const hasNoAlt = (Img: ImageData) => !Img.alt?.trim();

export const isJpeg = (img: ImageData) => /\.(jpg|jpeg)(\?|$)/gim.test(img.src);

export const isPng = (img: ImageData) => /\.png(\?|$)/gim.test(img.src);

export const isGif = (img: ImageData) => /\.gif(\?|$)/gim.test(img.src);

export const isSvg = (img: ImageData) => /\.svg(\?|$)/gim.test(img.src);

export const isWebp = (img: ImageData) => /\.webp(\?|$)/gim.test(img.src);
