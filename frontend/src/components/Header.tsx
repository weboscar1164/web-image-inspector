import SettingsIcon from "@mui/icons-material/Settings";
import {
	ALT_ITEMS,
	ASPECT_RATIO_ITEMS,
	FILTER_ITEMS,
	FORMAT_ITEMS,
} from "../constants/filterDefinitions";
import type { FilterCategoryId, FilterState, FormatFilterId } from "../Types";
import type { RefObject } from "react";
import type React from "react";
import { Select, MenuItem } from "@mui/material";

type SummaryItem = {
	id: string;
	label: string;
	value: number;
	visible: boolean;
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
	visibleFilterItems: Record<FilterCategoryId, boolean>;
	filters: FilterState;
	onSetFilters: (category: string, value: string | string[]) => void;
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
	filters,
	visibleFilterItems,
	onSetFilters,
}: Props) => {
	console.log(filters);
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
						{FILTER_ITEMS.filter((filter) => visibleFilterItems[filter.id]).map(
							(filter) => {
								switch (filter.id) {
									case "alt":
										return (
											<div key={filter.id} className="headerFilterRow">
												<span>{filter.label}</span>
												<Select
													size="small"
													value={filters.alt}
													onChange={(e) => onSetFilters("alt", e.target.value)}
												>
													{ALT_ITEMS.map((item) => (
														<MenuItem key={item.id} value={item.id}>
															{item.label}
														</MenuItem>
													))}
												</Select>
											</div>
										);
									case "aspectRatio":
										return (
											<div key={filter.id} className="headerFilterRow">
												<span>{filter.label}</span>
												<Select
													size="small"
													value={filters.aspectRatio}
													onChange={(e) =>
														onSetFilters("aspectRatio", e.target.value)
													}
												>
													{ASPECT_RATIO_ITEMS.map((item) => (
														<MenuItem key={item.id} value={item.id}>
															{item.label}
														</MenuItem>
													))}
												</Select>
											</div>
										);
									case "formats":
										return (
											<div key={filter.id} className="headerFilterRow">
												<span>{filter.label}</span>

												<Select
													size="small"
													multiple
													displayEmpty
													value={filters.formats}
													renderValue={(selected) => {
														console.log(selected);
														if (selected.length === 0) {
															return "すべて";
														}

														if (selected.length === 1) {
															return selected[0];
														}

														return `${selected.length} selected`;
													}}
													onChange={(e) => {
														const values = e.target.value as string[];

														if (values.includes("all")) {
															onSetFilters("formats", []);
															return;
														}
														onSetFilters(
															"formats",
															e.target.value as FormatFilterId[],
														);
													}}
												>
													{filters.formats.length !== 0 ? (
														<MenuItem value="all">すべて</MenuItem>
													) : (
														""
													)}
													{FORMAT_ITEMS.map((item) => (
														<MenuItem key={item.id} value={item.id}>
															{item.label}
														</MenuItem>
													))}
												</Select>
											</div>
										);
								}
							},
						)}
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
