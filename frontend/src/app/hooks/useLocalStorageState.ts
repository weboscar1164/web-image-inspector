import { useEffect, useState } from "react";

const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
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

export function useLocalStorageState<T>(key: string, defaultValue: T) {
	const [value, setValue] = useState<T>(() =>
		getLocalStorageItem(key, defaultValue),
	);

	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);
	return [value, setValue] as const;
}
