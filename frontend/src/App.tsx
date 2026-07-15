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
import { SUMMARY_ITEMS } from "./constants/summaryDefinitions";
import {
	ASPECT_RATIO_ITEMS,
	FILTER_ITEMS,
} from "./constants/filterDefinitions";
import { useLocalStorageState } from "./app/hooks/hooks";

type SummaryId = (typeof SUMMARY_ITEMS)[number]["id"];
type FilterId = (typeof FILTER_ITEMS)[number]["id"];
type FilterState = Record<FilterId, boolean>;
type AspectRatioId = (typeof ASPECT_RATIO_ITEMS)[number]["id"];
type VisibleAspectRatioId = Exclude<AspectRatioId, "all">;

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
	const [filters, setFilters] = useState<FilterState>({
		noAlt: false,
	});
	const [aspectRatio, setAspectRatio] = useState<AspectRatioId>("all");

	const [showSettings, setShowSettings] = useState(false);

	// Summary

	const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
		try {
			const saved = localStorage.getItem(key);

			if (!saved) return defaultValue;

			return {
				...defaultValue,
				...JSON.parse(saved),
			};
		} catch {
			return defaultValue;
		}
	};

	const [visibleSummaryItems, setVisibleSummaryItems] = useLocalStorageState(
		"visibleSummaryItems",

		{
			total: true,
			noAlt: true,
			vertical: true,
			horizontal: true,
			square: true,
		},
	);

	// Filter

	const [visibleFilterItems, setVisibleFilterItems] = useState<
		Record<FilterId, boolean>
	>(() =>
		getLocalStorageItem("visibleFilterItems", {
			noAlt: true,
		}),
	);
	const [visibleAspectRatioItems, setVisibleAspectRatioItems] = useState<
		Record<VisibleAspectRatioId, boolean>
	>(() =>
		getLocalStorageItem("visibleAspectRatioItems", {
			vertical: true,
			horizontal: true,
			square: true,
		}),
	);

	const hasAspectRatioFilter = Object.values(visibleAspectRatioItems).some(
		Boolean,
	);

	const aspectRatioItems = hasAspectRatioFilter
		? ASPECT_RATIO_ITEMS.filter(
				(item) => item.id === "all" || visibleAspectRatioItems[item.id],
			)
		: [];

	const isAllSelected =
		images.length > 0 && images.every((img) => selectedImages.has(img.src));

	const filteredImages = images.filter((img) => {
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

	const verticalCount = images.filter(isVertical).length;
	const horizontalCount = images.filter(isHorizontal).length;
	const squareCount = images.filter(isSquare).length;
	const noAltCount = images.filter(hasNoAlt).length;

	const resetViewState = () => {
		setFilters({
			noAlt: false,
		});
		setAspectRatio("all");
		setSelectedImages(new Set());
		setSelectedImage(null);
		setShowDetail(false);
	};

	const summaryValues: Record<SummaryId, number> = {
		total: images.length,
		noAlt: noAltCount,
		vertical: verticalCount,
		horizontal: horizontalCount,
		square: squareCount,
	};

	const summaryItems = SUMMARY_ITEMS.map((item) => ({
		...item,
		value: summaryValues[item.id],
		visible: visibleSummaryItems[item.id],
	}));

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

	useEffect(() => {
		localStorage.setItem(
			"visibleSummaryItems",
			JSON.stringify(visibleSummaryItems),
		);
	}, [visibleSummaryItems]);

	useEffect(() => {
		localStorage.setItem(
			"visibleFilterItems",
			JSON.stringify(visibleFilterItems),
		);
	}, [visibleFilterItems]);

	useEffect(() => {
		localStorage.setItem(
			"visibleAspectRatioItems",
			JSON.stringify(visibleAspectRatioItems),
		);
	}, [visibleAspectRatioItems]);

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
								{summaryItems &&
									summaryItems
										.filter((item) => item.visible)
										.map((summaryItem) => (
											<div className="headerSummaryItem" key={summaryItem.id}>
												<span>{summaryItem.label}</span>
												<strong>{summaryItem.value}</strong>
											</div>
										))}
							</div>
							<button onClick={() => setShowSettings(true)}>
								<SettingsIcon />
							</button>
						</div>
						<div
							className={`headerFilter ${showDetail ? "headerFilter--open" : ""}`}
						>
							<h4>フィルタ</h4>

							{FILTER_ITEMS.filter((item) => visibleFilterItems[item.id]).map(
								(item) => (
									<span key={item.id}>
										<input
											type="checkbox"
											id={item.id}
											checked={filters[item.id]}
											onChange={(e) =>
												setFilters((prev) => ({
													...prev,
													[item.id]: e.target.checked,
												}))
											}
										/>
										<label htmlFor={item.id}>{item.label}</label>
									</span>
								),
							)}
							{hasAspectRatioFilter &&
								aspectRatioItems.map((item) => (
									<span key={item.id}>
										<input
											type="radio"
											id={`aspect-${item.id || "all"}`}
											name="aspect-ratio"
											checked={aspectRatio === item.id}
											onChange={() => setAspectRatio(item.id)}
										/>
										<label htmlFor={`aspect-${item.id || "all"}`}>
											{item.label}
										</label>
									</span>
								))}
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
				{showSettings && (
					<div className="modal" onClick={() => setShowSettings(false)}>
						<button className="close">×</button>
						<div className="settingModal" onClick={(e) => e.stopPropagation()}>
							<h3>サマリー表示設定</h3>
							{SUMMARY_ITEMS.map((item) => (
								<label key={item.id}>
									<input
										type="checkbox"
										checked={visibleSummaryItems[item.id]}
										onChange={(e) =>
											setVisibleSummaryItems((prev) => ({
												...prev,
												[item.id]: e.target.checked,
											}))
										}
									/>
									{item.label}
								</label>
							))}
							<h3>フィルター表示設定</h3>
							{FILTER_ITEMS.map((item) => (
								<label key={item.id}>
									<input
										type="checkbox"
										checked={visibleFilterItems[item.id]}
										onChange={(e) =>
											setVisibleFilterItems((prev) => ({
												...prev,
												[item.id]: e.target.checked,
											}))
										}
									/>
									{item.label}
								</label>
							))}
							{ASPECT_RATIO_ITEMS.filter((item) => item.id !== "all").map(
								(item) => (
									<label key={item.id}>
										<input
											type="checkbox"
											checked={visibleAspectRatioItems[item.id]}
											onChange={(e) =>
												setVisibleAspectRatioItems((prev) => ({
													...prev,
													[item.id]: e.target.checked,
												}))
											}
										/>
										{item.label}
									</label>
								),
							)}
						</div>
					</div>
				)}
			</main>
		</div>
	);
}

export default App;
