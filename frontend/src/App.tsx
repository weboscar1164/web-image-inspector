import { useEffect, useMemo, useRef, useState } from "react";
import { analyzeImages } from "./services/api";
import "./App.scss";
import ImageGrid from "./components/ImageGrid";
import type { AspectRatioId, FilterState, ImageData, SummaryId } from "./Types";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
	hasNoAlt,
	isGif,
	isHorizontal,
	isJpeg,
	isPng,
	isSquare,
	isSvg,
	isVertical,
	isWebp,
} from "./utils/imageHelpers";

import { SUMMARY_ITEMS } from "./constants/summaryDefinitions";
import { ASPECT_RATIO_ITEMS } from "./constants/filterDefinitions";
import { useLocalStorageState } from "./app/hooks/hooks";
import SettingModal from "./components/SettingModal";
import Header from "./components/Header";
import ImageModal from "./components/ImageModal";
import { Snackbar, Alert } from "@mui/material";

type SnackbarState = {
	open: boolean;
	message: string;
	severity: "success" | "info" | "warning" | "error";
};

function App() {
	//===============================================
	// Ref
	//===============================================
	const headerRef = useRef<HTMLElement>(null);

	//===============================================
	// State
	//===============================================
	const [compactHeader, setCompactHeader] = useState(false);
	const [headerHeight, setHeaderHeight] = useState(0);
	const [showDetail, setShowDetail] = useState(false);
	const [url, setUrl] = useState("");
	const [images, setImages] = useState<ImageData[]>([]);
	const [loading, setLoading] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [filters, setFilters] = useState<FilterState>({
		noAlt: false,
	});
	const [aspectRatio, setAspectRatio] = useState<AspectRatioId>("all");
	const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [snackbarState, setSnackbarState] = useState<SnackbarState>({
		open: false,
		message: "",
		severity: "info",
	});
	const [visibleSummaryItems, setVisibleSummaryItems] = useLocalStorageState(
		"visibleSummaryItems",

		{
			total: true,
			noAlt: true,
			vertical: true,
			horizontal: true,
			square: true,
			jpeg: true,
			png: true,
			gif: true,
			svg: true,
			webp: true,
		},
	);
	const [visibleFilterItems, setVisibleFilterItems] = useLocalStorageState(
		"visibleFilterItems",
		{
			noAlt: true,
		},
	);
	const [visibleAspectRatioItems, setVisibleAspectRatioItems] =
		useLocalStorageState("visibleAspectRatioItems", {
			vertical: true,
			horizontal: true,
			square: true,
		});
	//===============================================
	// UI
	//===============================================
	const showToast = (
		message: string,
		severity: SnackbarState["severity"] = "info",
	) => {
		setSnackbarState({ open: true, message, severity });
	};

	//===============================================
	// Header
	//===============================================
	useEffect(() => {
		let lastY = window.scrollY;
		const handleScroll = () => {
			const currentY = window.scrollY;
			const delta = currentY - lastY;

			if (currentY < 100) {
				setCompactHeader(false);
			} else if (delta > 15) {
				setCompactHeader(true);
			} else if (delta < -15) {
				setCompactHeader(false);
			}

			lastY = currentY;
		};

		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	useEffect(() => {
		if (!headerRef.current) return;

		const observer = new ResizeObserver((entries) => {
			setHeaderHeight(entries[0].contentRect.height);
		});

		observer.observe(headerRef.current);

		return () => observer.disconnect();
	}, []);

	const onSetUrl = (url: string) => {
		setUrl(url);
	};

	const onOpenSettings = () => {
		setShowSettings(true);
	};

	const onToggleDetail = () => {
		setShowDetail((prev) => !prev);
	};

	//===============================================
	// Analysys
	//===============================================

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			new URL(url);
		} catch {
			return;
		}

		await handleAnalyze();
	};

	const handleAnalyze = async () => {
		setLoading(true);
		try {
			const data = await analyzeImages(url);
			setImages(data.images.images);

			resetViewState();
			console.log(data);
		} catch (e) {
			console.error(e);
		}
		setLoading(false);
	};

	//===============================================
	// Summary
	//===============================================
	const verticalCount = images.filter(isVertical).length;
	const horizontalCount = images.filter(isHorizontal).length;
	const squareCount = images.filter(isSquare).length;
	const noAltCount = images.filter(hasNoAlt).length;
	const jpegCount = images.filter(isJpeg).length;
	const pngCount = images.filter(isPng).length;
	const gifCount = images.filter(isGif).length;
	const svgCount = images.filter(isSvg).length;
	const webpCount = images.filter(isWebp).length;

	const summaryValues: Record<SummaryId, number> = {
		total: images.length,
		noAlt: noAltCount,
		vertical: verticalCount,
		horizontal: horizontalCount,
		square: squareCount,
		jpeg: jpegCount,
		png: pngCount,
		gif: gifCount,
		svg: svgCount,
		webp: webpCount,
	};

	const summaryItems = SUMMARY_ITEMS.map((item) => ({
		...item,
		value: summaryValues[item.id],
		visible: visibleSummaryItems[item.id],
	}));

	//===============================================
	// Filter
	//===============================================
	const onSetFilters = (itemId: string, value: boolean) => {
		setFilters((prev) => ({
			...prev,
			[itemId]: value,
		}));
	};

	const onSetAspectRatio = (itemId: AspectRatioId) => {
		setAspectRatio(itemId);
	};

	const hasAspectRatioFilter = Object.values(visibleAspectRatioItems).some(
		Boolean,
	);

	const aspectRatioItems = hasAspectRatioFilter
		? ASPECT_RATIO_ITEMS.filter(
				(item) => item.id === "all" || visibleAspectRatioItems[item.id],
			)
		: [];

	const filteredImages = useMemo(() => {
		return images.filter((img) => {
			if (filters.noAlt && !hasNoAlt(img)) {
				return false;
			}

			switch (aspectRatio) {
				case "vertical":
					return isVertical(img);

				case "horizontal":
					return isHorizontal(img);

				case "square":
					return isSquare(img);

				case "all":
				default:
					return true;
			}
		});
	}, [images, filters.noAlt, aspectRatio]);

	//===============================================
	// Selection
	//===============================================

	const isAllSelected =
		images.length > 0 && images.every((img) => selectedImages.has(img.src));

	const toggleSelect = (src: string) => {
		setSelectedImages((prev) => {
			const next = new Set(prev);

			if (next.has(src)) {
				next.delete(src);
			} else {
				next.add(src);
			}

			return next;
		});
	};

	const toggleSelectAll = () => {
		if (isAllSelected) {
			setSelectedImages(new Set());
		} else {
			setSelectedImages(new Set(images.map((img) => img.src)));
		}
	};

	//===============================================
	// Modal
	//===============================================
	const closeImageModal = () => {
		return setSelectedIndex(null);
	};

	const currentImage =
		selectedIndex !== null ? filteredImages[selectedIndex] : null;

	const nextImage = () => {
		if (selectedIndex === null) return;

		setSelectedIndex((prev) => {
			if (prev === null) return null;
			return (prev + 1) % filteredImages.length;
		});
	};

	const prevImage = () => {
		if (selectedIndex === null) return;

		setSelectedIndex((prev) => {
			if (prev === null) return null;
			return (prev - 1 + filteredImages.length) % filteredImages.length;
		});
	};

	useEffect(() => {
		if (selectedIndex === null) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") {
				prevImage();
			}
			if (e.key === "ArrowRight") {
				nextImage();
			}
			if (e.key === "Escape") {
				setSelectedIndex(null);
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [selectedIndex, filteredImages.length]);

	const handleCopyImageUrl = async () => {
		if (!currentImage) return;

		try {
			await navigator.clipboard.writeText(currentImage.src);
			showToast("Image URL copied", "success");
		} catch (e) {
			console.error("Faled to copy URL: ", e);
			showToast("Faled to copy URL", "error");
		}
	};

	const handleOpenOriginalImage = () => {
		if (!currentImage) return;

		window.open(currentImage.src, "_blank");
	};

	const handleDownloadImage = async () => {
		if (!currentImage) return;

		try {
			const res = await fetch(currentImage.src);
			const blob = await res.blob();

			saveAs(blob, "image.jpg");
			showToast("Download success", "success");
		} catch (e) {
			console.error("failed:", url);
			showToast("Download failed", "error");
		}
	};

	//===============================================
	// Download
	//===============================================

	const handleDownload = async () => {
		const zip = new JSZip();
		let i = 0;
		let failedCount = 0;

		try {
			for (const url of selectedImages) {
				try {
					const res = await fetch(url);
					const blob = await res.blob();

					zip.file(`image_${i}.jpg`, blob);
					i++;
				} catch {
					failedCount++;
				}
			}

			const content = await zip.generateAsync({ type: "blob" });
			saveAs(content, "images.zip");

			if (failedCount > 0) {
				showToast(`${failedCount} images failed to download`, "warning");
			} else {
				showToast("Download success", "success");
			}
		} catch (e) {
			console.error("download error: ", e);
			showToast("Download failed", "error");
		}
	};

	const resetViewState = () => {
		setFilters({
			noAlt: false,
		});
		setAspectRatio("all");
		setSelectedImages(new Set());
		setSelectedIndex(null);
		setShowDetail(false);
	};

	return (
		<div className="app">
			<Header
				url={url}
				headerRef={headerRef}
				compactHeader={compactHeader}
				onSetUrl={onSetUrl}
				handleSubmit={handleSubmit}
				handleDownload={handleDownload}
				selectedImages={selectedImages}
				toggleSelectAll={toggleSelectAll}
				isAllSelected={isAllSelected}
				showDetail={showDetail}
				onToggleDetail={onToggleDetail}
				summaryItems={summaryItems}
				onOpenSettings={onOpenSettings}
				visibleFilterItems={visibleFilterItems}
				filters={filters}
				onSetFilters={onSetFilters}
				hasAspectRatioFilter={hasAspectRatioFilter}
				aspectRatioItems={aspectRatioItems}
				aspectRatio={aspectRatio}
				onSetAspectRatio={onSetAspectRatio}
			/>

			<main>
				{loading && (
					<div className="loading">
						<p>Loading...</p>
					</div>
				)}

				<ImageGrid
					images={filteredImages}
					onClickImage={setSelectedIndex}
					selectedImages={selectedImages}
					onToggleSelect={toggleSelect}
					headerHeight={headerHeight}
				/>

				<ImageModal
					currentImage={currentImage}
					closeImageModal={closeImageModal}
					selectedIndex={selectedIndex}
					images={images}
					prevImage={prevImage}
					nextImage={nextImage}
					handleCopyImageUrl={handleCopyImageUrl}
					handleDownloadImage={handleDownloadImage}
					handleOpenOriginalImage={handleOpenOriginalImage}
				/>

				<SettingModal
					open={showSettings}
					onClose={() => setShowSettings(false)}
					visibleSummaryItems={visibleSummaryItems}
					setVisibleSummaryItems={setVisibleSummaryItems}
					visibleFilterItems={visibleFilterItems}
					setVisibleFilterItems={setVisibleFilterItems}
					visibleAspectRatioItems={visibleAspectRatioItems}
					setVisibleAspectRatioItems={setVisibleAspectRatioItems}
				/>

				<Snackbar
					open={snackbarState.open}
					autoHideDuration={2000}
					onClose={() => setSnackbarState((prev) => ({ ...prev, open: false }))}
					anchorOrigin={{
						vertical: "top",
						horizontal: "center",
					}}
				>
					<Alert severity={snackbarState.severity} variant="filled">
						{snackbarState.message}
					</Alert>
				</Snackbar>
			</main>
		</div>
	);
}

export default App;
