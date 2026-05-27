import { FixedSizeGrid as Grid } from "react-window";
import type { ImageData } from "../Types";
import { useEffect, useRef, useState } from "react";

type Props = {
	images: ImageData[];
	onClickImage: (src: string) => void;
	selectedImages: Set<string>;
	onToggleSelect: (src: string) => void;
	onGridWidthChange?: (width: number) => void;
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
	onGridWidthChange,
}: Props) => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });

	const CARD_WIDTH = 200;
	const CARD_HEIGHT = 215;
	const GAP = 12;
	const CELL_SIZE = CARD_WIDTH + GAP;
	const columnCount = Math.max(1, Math.floor(size.width / CELL_SIZE));
	const rowCount = Math.ceil(images.length / columnCount);
	const gridWidth = columnCount * CELL_SIZE;

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

	useEffect(() => {
		onGridWidthChange?.(gridWidth);
	}, [gridWidth, onGridWidthChange]);

	const { width, height } = size;

	return (
		<div className="gridOuter">
			<div className="gridWrapper" ref={wrapperRef}>
				{width > 0 && (
					<Grid
						columnCount={columnCount}
						columnWidth={CARD_WIDTH + GAP}
						rowCount={rowCount}
						rowHeight={CARD_HEIGHT + GAP}
						height={height}
						width={gridWidth}
						style={{
							padding: GAP / 2,
						}}
					>
						{({ columnIndex, rowIndex, style }: GridChildProps) => {
							const index = rowIndex * columnCount + columnIndex;
							const image = images[index];
							if (!image) return null;

							const isSelected = selectedImages.has(image.src);

							return (
								<div
									style={{
										...style,
										padding: GAP / 2,
										boxSizing: "border-box",
									}}
								>
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
