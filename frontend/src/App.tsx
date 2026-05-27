import { useState } from "react";
import { analyzeImages } from "./services/api";

import "./App.scss";
import ImageGrid from "./components/ImageGrid";
import type { ImageData } from "./Types";
import JSZip from "jszip";
import { saveAs } from "file-saver";

function App() {
	const [url, setUrl] = useState("");
	const [images, setImages] = useState<ImageData[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
	const [gridWidth, setGridWidth] = useState(0);

	const isAllSelected =
		images.length > 0 && images.every((img) => selectedImages.has(img.src));

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
			<header>
				<div className="headerContainer" style={{ width: gridWidth }}>
					<h1>Web Image Inspector</h1>

					<form onSubmit={handleSubmit}>
						<input
							type="text"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://example.com"
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
			</header>

			<main>
				{loading && (
					<div className="loading">
						<p>Loading...</p>
					</div>
				)}
				<ImageGrid
					images={images}
					onClickImage={(src) => setSelectedImage(src)}
					selectedImages={selectedImages}
					onToggleSelect={toggleSelect}
					onGridWidthChange={setGridWidth}
				/>
				{selectedImage && (
					<div className="modal" onClick={() => setSelectedImage(null)}>
						<button className="close">×</button>
						<img
							src={selectedImage}
							alt=""
							onClick={(e) => e.stopPropagation()}
						/>
					</div>
				)}
			</main>
		</div>
	);
}

export default App;
