/** GAP-086 — no incrementArticleView API; session dedupe + optimistic UI until backend ships. */

const SESSION_KEY = 'fixora_article_views_recorded';

function readSessionSet(): Set<string> {
	if (typeof window === 'undefined') return new Set();
	try {
		const raw = sessionStorage.getItem(SESSION_KEY);
		if (!raw) return new Set();
		const parsed = JSON.parse(raw);
		return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []);
	} catch {
		return new Set();
	}
}

function writeSessionSet(set: Set<string>): void {
	if (typeof window === 'undefined') return;
	sessionStorage.setItem(SESSION_KEY, JSON.stringify([...set]));
}

/** Returns true when this session has not recorded a view yet (caller should bump UI). */
export function recordArticleView(articleId: string): boolean {
	if (!articleId) return false;
	const set = readSessionSet();
	if (set.has(articleId)) return false;
	set.add(articleId);
	writeSessionSet(set);
	return true;
}

export function hasRecordedArticleView(articleId: string): boolean {
	return readSessionSet().has(articleId);
}
