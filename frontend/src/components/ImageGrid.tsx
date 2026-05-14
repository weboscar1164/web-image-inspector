import { FixedSizeGrid as Grid } from "react-window";
import type { ImageData } from "../Types";
import { useEffect, useRef, useState } from "react";

type Props = {
	images: ImageData[];
	onClickImage: (src: string) => void;
	selectedImages: Set<string>;
	onToggleSelect: (src: string) => void;
};

type GridChildProps = {
	columnIndex: number;
	rowIndex: number;
	style: React.CSSProperties;
};

const ImageGrid = ({
	images,
	onClickImage,
	selectedImages,
	onToggleSelect,
}: Props) => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });

	const ITEM_SIZE = 200;
	const columnCount = Math.max(1, Math.floor(size.width / ITEM_SIZE));
	const rowCount = Math.ceil(images.length / columnCount);
	const gridWidth = columnCount * ITEM_SIZE;

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

	const { width, height } = size;

	return (
		<div className="gridOuter">
			<div className="gridWrapper" ref={wrapperRef}>
				{width > 0 && (
					<Grid
						columnCount={columnCount}
						columnWidth={ITEM_SIZE}
						rowCount={rowCount}
						rowHeight={ITEM_SIZE}
						height={height}
						width={gridWidth}
					>
						{({ columnIndex, rowIndex, style }: GridChildProps) => {
							const index = rowIndex * columnCount + columnIndex;
							const image = images[index];
							if (!image) return null;

							const isSelected = selectedImages.has(image.src);

							return (
								<div style={style}>
									<div className={`card ${isSelected ? "selected" : ""}`}>
										<input
											type="checkbox"
											checked={isSelected}
											onChange={() => onToggleSelect(image.src)}
										/>
										<img
											src={image.src}
											alt={image.alt}
											onClick={() => onClickImage(image.src)}
										/>
										<p>{image.alt}</p>
									</div>
								</div>
							);
						}}
					</Grid>
				)}
			</div>
		</div>
	);
};

export default ImageGrid;
