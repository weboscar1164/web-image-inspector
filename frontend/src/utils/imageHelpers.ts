import type { ImageData } from "../Types";

export const isVertical = (img: ImageData) => img.height > img.width;

export const isHorizontal = (img: ImageData) => img.width > img.height;

export const isSquare = (Img: ImageData) => Img.width === Img.height;

export const hasNoAlt = (Img: ImageData) => !Img.alt?.trim();
