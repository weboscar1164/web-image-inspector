import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import type { ImageData } from "../Types";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { useState } from "react";

type Props = {
	currentImage: ImageData | null;
	closeImageModal: () => void;
	selectedIndex: number | null;
	images: ImageData[];
	prevImage: () => void;
	nextImage: () => void;
	handleCopyImageUrl: () => void;
	handleDownloadImage: () => void;
	handleOpenOriginalImage: () => void;
};

const ImageModal = ({
	currentImage,
	closeImageModal,
	selectedIndex,
	images,
	prevImage,
	nextImage,
	handleCopyImageUrl,
	handleDownloadImage,
	handleOpenOriginalImage,
}: Props) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const open = Boolean(anchorEl);

	const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};
	return (
		<>
			{currentImage && (
				<div className="modal" onClick={closeImageModal}>
					<button className="modalClose">×</button>
					<IconButton
						onClick={(e) => {
							e.stopPropagation();
							handleMenuOpen(e);
						}}
						className="modalMenuOpen"
					>
						<MoreVertIcon />
					</IconButton>
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
					<Menu
						anchorEl={anchorEl}
						open={open}
						onClose={handleMenuClose}
						onClick={(e) => e.stopPropagation()}
					>
						<MenuItem onClick={handleCopyImageUrl}>Copy image URL</MenuItem>
						<MenuItem onClick={handleDownloadImage}>Download image</MenuItem>
						<MenuItem onClick={handleOpenOriginalImage}>
							Open original image
						</MenuItem>
					</Menu>
				</div>
			)}
		</>
	);
};

export default ImageModal;
