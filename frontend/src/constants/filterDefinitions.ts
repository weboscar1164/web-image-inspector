export const FILTER_ITEMS = [
	{
		id: "noAlt",
		label: "altなし",
	},
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
