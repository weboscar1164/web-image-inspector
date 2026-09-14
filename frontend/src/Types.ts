import type {
	ALT_ITEMS,
	ASPECT_RATIO_ITEMS,
	FILTER_ITEMS,
	FORMAT_ITEMS,
} from "./constants/filterDefinitions";
import { SUMMARY_ITEMS } from "./constants/summaryDefinitions";

export interface ImageData {
	src: string;
	alt?: string;
	width: number;
	height: number;
	type: string;
}
export type FilterState = {
	alt: AltFilterId;
	aspectRatio: AspectRatioId;
	formats: FormatFilterId[];
};
export type SummaryId = (typeof SUMMARY_ITEMS)[number]["id"];
export type FilterCategoryId = (typeof FILTER_ITEMS)[number]["id"];
export type AltFilterId = (typeof ALT_ITEMS)[number]["id"];
export type AspectRatioId = (typeof ASPECT_RATIO_ITEMS)[number]["id"];
export type FormatFilterId = (typeof FORMAT_ITEMS)[number]["id"];
export type VisibleAspectRatioId = Exclude<AspectRatioId, "all">;
