export const FILTER_ITEMS = [
	{
		id: "alt",
		label: "Alt",
	},
	{
		id: "aspectRatio",
		label: "Ratio",
	},
	{
		id: "formats",
		label: "Formats",
	},
] as const;

export const ALT_ITEMS = [
	{
		id: "all",
		label: "すべて",
	},
	{
		id: "noAlt",
		label: "altなし",
	},
	{
		id: "hasAlt",
		label: "altあり",
	},
] as const;

export const ASPECT_RATIO_ITEMS = [
	{
		id: "all",
		label: "すべて",
	},
	{
		id: "vertical",
		label: "縦長",
	},
	{
		id: "horizontal",
		label: "横長",
	},
	{
		id: "square",
		label: "正方形",
	},
] as const;

export const FORMAT_ITEMS = [
	{
		id: "jpeg",
		label: "jpeg",
	},
	{
		id: "png",
		label: "png",
	},
	{
		id: "gif",
		label: "gif",
	},
	{
		id: "svg",
		label: "svg",
	},
	{
		id: "webp",
		label: "webp",
	},
	{
		id: "avif",
		label: "avif",
	},
] as const;
