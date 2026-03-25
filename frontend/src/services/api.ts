export const analyzeImages = async (url: string) => {
	const res = await fetch("http//:127.0.0.1:80000/analyze", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ url }),
	});

	return res.json();
};
