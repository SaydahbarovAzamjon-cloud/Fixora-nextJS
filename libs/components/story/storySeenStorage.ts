const STORAGE_KEY = 'fixora_seen_stories';

const readIds = (): Set<string> => {
	if (typeof window === 'undefined') return new Set();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return new Set();
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? new Set(parsed.filter((id) => typeof id === 'string')) : new Set();
	} catch {
		return new Set();
	}
};

export const isStorySeen = (storyId: string): boolean => readIds().has(storyId);

export const markStorySeen = (storyId: string): void => {
	if (typeof window === 'undefined') return;
	const ids = readIds();
	ids.add(storyId);
	localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
};
