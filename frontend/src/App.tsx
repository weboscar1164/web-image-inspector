import { useEffect, useRef, useState } from "react";
import { analyzeImages } from "./services/api";
import "./App.scss";
import ImageGrid from "./components/ImageGrid";
import type { ImageData } from "./Types";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
	hasNoAlt,
	isHorizontal,
	isSquare,
	isVertical,
} from "./utils/imageHelpers";
import SettingsIcon from "@mui/icons-material/Settings";

function App() {
	const headerRef = useRef<HTMLElement>(null);
	const [compactHeader, setCompactHeader] = useState(false);
	const [headerHeight, setHeaderHeight] = useState(0);
	const [url, setUrl] = useState("");
	const [images, setImages] = useState<ImageData[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
	const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
	const [showDetail, setShowDetail] = useState(false);
	const [filters, setFilters] = useState({
		noAlt: false,
		aspectRatio: "",
	});

	const isAllSelected =
		images.length > 0 && images.every((img) => selectedImages.has(img.src));

	const filteredImages = images.filter((img) => {
		if (filters.noAlt && !hasNoAlt(img)) {
			return false;
		}

		switch (filters.aspectRatio) {
			case "vertical":
				return isVertical(img);

			case "horizontal":
				return isHorizontal(img);

			case "square":
				return isSquare(img);

			default:
				return true;
		}
	});

	const verticalCount = images.filter(isVertical).length;
	const horizontalCount = images.filter(isHorizontal).length;
	const squareCount = images.filter(isSquare).length;
	const noAltCount = images.filter(hasNoAlt).length;

	const resetViewState = () => {
		setFilters({
			noAlt: false,
			aspectRatio: "",
		});
		setSelectedImages(new Set());
		setSelectedImage(null);
		setShowDetail(false);
	};

	useEffect(() => {
		if (!headerRef.current) return;

		const observer = new ResizeObserver((entries) => {
			setHeaderHeight(entries[0].contentRect.height);
		});

		observer.observe(headerRef.current);

		return () => observer.disconnect();
	}, []);

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

	const handleDownload = async () => {
		const zip = new JSZip();
		let i = 0;

		for (const url of selectedImages) {
			try {
				const res = await fetch(url);
				const blob = await res.blob();

				zip.file(`image_${i}.jpg`, blob);
				i++;
			} catch (e) {
				console.error("faild: ", url);
			}
		}

		const content = await zip.generateAsync({ type: "blob" });
		saveAs(content, "images.zip");
	};

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

	return (
		<div className="app">
			<header
				ref={headerRef}
				className={`header ${compactHeader ? "header-compact" : ""}`}
			>
				<div className="container headerContainer">
					<h1>Web Image Inspector</h1>
					<div className="headerUpper">
						<div className="headerForm">
							<form onSubmit={handleSubmit}>
								<input
									type="text"
									value={url}
									onChange={(e) => setUrl(e.target.value)}
									placeholder="https://example.com"
									onFocus={(e) => {
										if (e.target.value) {
											e.target.select();
										}
									}}
									style={{ width: "300px" }}
								/>

								<button type="submit">Analyze</button>
							</form>
							<button onClick={handleDownload}>
								Download Selected ({selectedImages.size})
							</button>
							<button onClick={toggleSelectAll}>
								{isAllSelected ? "Deselect all" : "Select all"}
							</button>
						</div>
						<button onClick={() => setShowDetail((prev) => !prev)}>
							Filters{showDetail ? "▲" : "▼"}
						</button>
					</div>
					<div className="headerExtra">
						<div className="headerSummary">
							<div className="headerSummaryLeft">
								<h4>サマリー：</h4>
								<div className="headerSummaryItem">
									<span>画像数</span>
									<strong>{images.length}</strong>
								</div>
								<div className="headerSummaryItem">
									<span>altなし</span>
									<strong>{noAltCount}</strong>
								</div>
								<div className="headerSummaryItem">
									<span>縦長</span>
									<strong>{verticalCount}</strong>
								</div>
								<div className="headerSummaryItem">
									<span>横長</span>
									<strong>{horizontalCount}</strong>
								</div>
								<div className="headerSummaryItem">
									<span>正方形</span>
									<strong>{squareCount}</strong>
								</div>
							</div>
							<button>
								<SettingsIcon />
							</button>
						</div>
						<div
							className={`headerFilter ${showDetail ? "headerFilter--open" : ""}`}
						>
							<h4>フィルタ</h4>

							<span>
								<input
									type="checkbox"
									id="noAlt"
									checked={filters.noAlt}
									onChange={(e) =>
										setFilters((prev) => ({ ...prev, noAlt: e.target.checked }))
									}
								/>
								<label htmlFor="noAlt">Altなし</label>
							</span>
							<span>
								<input
									type="radio"
									name="aspect_ratio"
									id="vertical"
									checked={filters.aspectRatio === ""}
									onChange={() =>
										setFilters((prev) => ({
											...prev,
											aspectRatio: "",
										}))
									}
								/>
								<label htmlFor="vertical">すべて</label>
							</span>
							<span>
								<input
									type="radio"
									name="aspect_ratio"
									id="vertical"
									checked={filters.aspectRatio === "vertical"}
									onChange={() =>
										setFilters((prev) => ({
											...prev,
											aspectRatio: "vertical",
										}))
									}
								/>
								<label htmlFor="vertical">縦長</label>
							</span>
							<span>
								<input
									type="radio"
									name="aspect_ratio"
									id="horizontal"
									checked={filters.aspectRatio === "horizontal"}
									onChange={() =>
										setFilters((prev) => ({
											...prev,
											aspectRatio: "horizontal",
										}))
									}
								/>
								<label htmlFor="horizontal">横長</label>
							</span>
							<span>
								<input
									type="radio"
									name="aspect_ratio"
									id="square"
									checked={filters.aspectRatio === "square"}
									onChange={() =>
										setFilters((prev) => ({ ...prev, aspectRatio: "square" }))
									}
								/>
								<label htmlFor="square">正方形</label>
							</span>
						</div>
					</div>
				</div>
			</header>

			<main>
				{loading && (
					<div className="loading">
						<p>Loading...</p>
					</div>
				)}
				<ImageGrid
					images={filteredImages}
					onClickImage={setSelectedImage}
					selectedImages={selectedImages}
					onToggleSelect={toggleSelect}
					headerHeight={headerHeight}
				/>
				{selectedImage && (
					<div className="modal" onClick={() => setSelectedImage(null)}>
						<button className="close">×</button>
						<div className="modalWrapper">
							<div className="modalImageFrame">
								<img
									src={selectedImage.src}
									alt=""
									onClick={(e) => e.stopPropagation()}
								/>
							</div>
							<div className="modalTextFrame">
								<p>{selectedImage.alt}</p>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}

export default App;
