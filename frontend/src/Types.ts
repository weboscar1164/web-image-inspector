import type {
	ASPECT_RATIO_ITEMS,
	FILTER_ITEMS,
} from "./constants/filterDefinitions";
import { SUMMARY_ITEMS } from "./constants/summaryDefinitions";

export interface ImageData {
	src: string;
	alt?: string;
	width: number;
	height: number;
}

export type SummaryId = (typeof SUMMARY_ITEMS)[number]["id"];
export type FilterId = (typeof FILTER_ITEMS)[number]["id"];
export type FilterState = Record<FilterId, boolean>;
export type AspectRatioId = (typeof ASPECT_RATIO_ITEMS)[number]["id"];
export type VisibleAspectRatioId = Exclude<AspectRatioId, "all">;
