import type { ImageData } from "../Types";

type Props = {
	images: ImageData[];
	onClickImage: (src: string) => void;
	selectedImages: string[];
	onToggleSelect: (src: string) => void;
};
const ImageGrid = ({
	images,
	onClickImage,
	selectedImages,
	onToggleSelect,
}: Props) => {
	return (
		<div className="grid">
			{images.map((img, index) => {
				const isSelected = selectedImages.includes(img.src);

				return (
					<div className={`card ${isSelected ? "selected" : ""}`} key={index}>
						<input
							type="checkbox"
							checked={isSelected}
							onChange={() => onToggleSelect(img.src)}
						/>
						<img
							src={img.src}
							alt={img.alt}
							onClick={() => onClickImage(img.src)}
						/>
						<p>{img.alt}</p>
					</div>
				);
			})}
		</div>
	);
};

export default ImageGrid;
