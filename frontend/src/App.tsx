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

	const isAllSelected =
		images.length > 0 && images.every((img) => selectedImages.has(img.src));

	const hanldeAnalyze = async () => {
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
				<h1>Web Image Inspector</h1>

				<input
					type="text"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					placeholder="https://example.com"
					style={{ width: "300px" }}
				/>

				<button onClick={hanldeAnalyze}>Analyze</button>
				<button onClick={handleDownload}>
					Download Selected ({selectedImages.size})
				</button>
				<button onClick={toggleSelectAll}>
					{isAllSelected ? "Deselect all" : "Select all"}
				</button>
			</header>

			<main>
				{loading && <p>Loading...</p>}
				<ImageGrid
					images={images}
					onClickImage={(src) => setSelectedImage(src)}
					selectedImages={selectedImages}
					onToggleSelect={toggleSelect}
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
