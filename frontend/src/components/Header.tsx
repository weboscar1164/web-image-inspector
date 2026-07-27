import SettingsIcon from "@mui/icons-material/Settings";
import { FILTER_ITEMS } from "../constants/filterDefinitions";
import type { AspectRatioId, FilterId, FilterState } from "../Types";
import type { RefObject } from "react";
import type React from "react";

type SummaryItem = {
	id: string;
	label: string;
	value: number;
	visible: boolean;
};

type AspectRatioItem = {
	id: AspectRatioId;
	label: string;
};

type Props = {
	url: string;
	headerRef: RefObject<HTMLElement | null>;
	compactHeader: boolean;
	onSetUrl: (e: string) => void;
	handleSubmit: (e: React.FormEvent) => Promise<void>;
	handleDownload: () => void;
	selectedImages: Set<string>;
	toggleSelectAll: () => void;
	isAllSelected: boolean;
	showDetail: boolean;
	onToggleDetail: () => void;
	summaryItems: SummaryItem[];
	onOpenSettings: () => void;
	visibleFilterItems: Record<string, boolean>;
	filters: FilterState;
	onSetFilters: (itemId: FilterId, value: boolean) => void;
	hasAspectRatioFilter: boolean;
	aspectRatioItems: AspectRatioItem[];
	aspectRatio: AspectRatioId;
	onSetAspectRatio: (itemId: AspectRatioId) => void;
};

const Header = ({
	url,
	headerRef,
	compactHeader,
	onSetUrl,
	handleSubmit,
	handleDownload,
	selectedImages,
	toggleSelectAll,
	isAllSelected,
	showDetail,
	onToggleDetail,
	summaryItems,
	onOpenSettings,
	visibleFilterItems,
	filters,
	onSetFilters,
	hasAspectRatioFilter,
	aspectRatioItems,
	aspectRatio,
	onSetAspectRatio,
}: Props) => {
	return (
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
								onChange={(e) => onSetUrl(e.target.value)}
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
					<button onClick={() => onToggleDetail()}>
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
						<button onClick={() => onOpenSettings()}>
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
										onChange={(e) => onSetFilters(item.id, e.target.checked)}
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
										onChange={() => onSetAspectRatio(item.id)}
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
	);
};

export default Header;
