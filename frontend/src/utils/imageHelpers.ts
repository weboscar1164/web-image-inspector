import type { ImageData } from "../Types";

export const isVertical = (img: ImageData) => img.height > img.width;

export const isHorizontal = (img: ImageData) => img.width > img.height;

export const isSquare = (Img: ImageData) => Img.width === Img.height;

export const hasNoAlt = (Img: ImageData) => !Img.alt?.trim();

export const isJpeg = (img: ImageData) =>
	img.type === "jpg" || img.type === "jpeg";

export const isPng = (img: ImageData) => img.type === "png";

export const isGif = (img: ImageData) => img.type === "gif";

export const isSvg = (img: ImageData) => img.type === "svg";

export const isWebp = (img: ImageData) => img.type === "webp";

export const isAvif = (img: ImageData) => img.type === "avif";
