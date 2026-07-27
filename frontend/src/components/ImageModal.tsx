import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import type { ImageData } from "../Types";

type Props = {
	currentImage: ImageData | null;
	closeImageModal: () => void;
	selectedIndex: number | null;
	images: ImageData[];
	prevImage: () => void;
	nextImage: () => void;
};

const ImageModal = ({
	currentImage,
	closeImageModal,
	selectedIndex,
	images,
	prevImage,
	nextImage,
}: Props) => {
	return (
		<>
			{currentImage && (
				<div className="modal" onClick={closeImageModal}>
					<button className="close">×</button>
					<span className="modalIndex">
						{selectedIndex !== null ? selectedIndex + 1 : 0} / {images.length}
					</span>
					<div className="modalWrapper" onClick={(e) => e.stopPropagation()}>
						<div className="modalImageFrame">
							<div className="modalPrevArea" onClick={prevImage}>
								<ArrowBackIosIcon />
							</div>
							<img src={currentImage.src} alt="" />
							<div className="modalNextArea" onClick={nextImage}>
								<ArrowForwardIosIcon />
							</div>
						</div>
						<div className="modalInfo">
							<div>
								<span>height</span>
								<strong>{currentImage.height}</strong>
							</div>
							<div>
								<span>width</span>
								<strong>{currentImage.width}</strong>
							</div>
							<div>
								<span>alt</span>
								<strong>{currentImage.alt || "none"}</strong>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default ImageModal;
