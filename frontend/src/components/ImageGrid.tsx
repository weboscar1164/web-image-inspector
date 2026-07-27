import type { ImageData } from "../Types";
import { memo, useEffect, useRef, useState } from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

type Props = {
	images: ImageData[];
	onClickImage: (index: number) => void;
	selectedImages: Set<string>;
	onToggleSelect: (src: string) => void;
	headerHeight: number;
};

const ImageGrid = ({
	images,
	onClickImage,
	selectedImages,
	onToggleSelect,
	headerHeight,
}: Props) => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [loaded, setLoaded] = useState(false);
	const [size, setSize] = useState({ width: 0, height: 0 });

	const CARD_WIDTH = 200;
	const GAP = 12;
	const CELL_SIZE = CARD_WIDTH + GAP;
	const columnCount = Math.max(1, Math.floor(size.width / CELL_SIZE));

	useEffect(() => {
		if (images.length > 0) {
			setLoaded(false);
			requestAnimationFrame(() => {
				setLoaded(true);
			});
		}
		// console.log(images);
	}, [images]);

	useEffect(() => {
		if (!wrapperRef.current) return;

		const observer = new ResizeObserver(([entry]) => {
			setSize({
				width: entry.contentRect.width,
				height: entry.contentRect.height,
			});
		});

		observer.observe(wrapperRef.current);

		return () => observer.disconnect();
	}, []);

	const truncate = (text: string | undefined, maxLength: number): string => {
		return text
			? text.length > maxLength
				? text.slice(0, maxLength) + "..."
				: text
			: "";
	};

	return (
		<div
			className="container"
			ref={wrapperRef}
			style={{ paddingTop: headerHeight }}
		>
			<ImageList
				cols={columnCount}
				gap={12}
				sx={{
					overflow: "visible",
				}}
			>
				{images.map((image, index) => {
					const isSelected = selectedImages.has(image.src);
					return (
						<ImageListItem key={image.src}>
							<div
								className={`card ${isSelected ? "selected" : ""} ${loaded ? "show" : ""}`}
								style={{ transitionDelay: `${index * 20}ms` }}
							>
								<input
									type="checkbox"
									checked={isSelected}
									onChange={() => onToggleSelect(image.src)}
								/>
								<div className="cardImgFrame">
									<img
										src={image.src}
										alt={image.alt}
										onClick={() => onClickImage(index)}
									/>
								</div>
								<p>{truncate(image.alt, 29)}</p>
							</div>
						</ImageListItem>
					);
				})}
			</ImageList>
		</div>
	);
};

export default memo(ImageGrid);
