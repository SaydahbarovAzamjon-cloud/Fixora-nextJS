/** BACKEND_GAPS: GAP-085 — no saveArticle API; localStorage until backend ships. */

const STORAGE_KEY = 'fixora_saved_articles';

function readIds(): string[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
	} catch {
		return [];
	}
}

function writeIds(ids: string[]): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function isArticleSaved(articleId: string): boolean {
	return readIds().includes(articleId);
}

/** Toggle saved state; returns new saved flag. */
export function toggleSavedArticle(articleId: string): boolean {
	const ids = readIds();
	const exists = ids.includes(articleId);
	if (exists) {
		writeIds(ids.filter((id) => id !== articleId));
		return false;
	}
	writeIds([articleId, ...ids]);
	return true;
}
