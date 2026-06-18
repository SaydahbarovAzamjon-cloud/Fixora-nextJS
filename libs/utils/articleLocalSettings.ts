import { VisibilityMode } from '../hooks/useWriteArticleForm';

export interface ArticleLocalSettings {
	featured: boolean;
	allowComments: boolean;
	visibility: VisibilityMode;
}

const STORAGE_KEY = 'fixora_article_local_settings';

type SettingsMap = Record<string, ArticleLocalSettings>;

function readMap(): SettingsMap {
	if (typeof window === 'undefined') return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as SettingsMap) : {};
	} catch {
		return {};
	}
}

function writeMap(map: SettingsMap): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
	} catch {
		/* quota exceeded */
	}
}

export function getArticleLocalSettings(articleId: string): ArticleLocalSettings | null {
	const map = readMap();
	return map[articleId] ?? null;
}

export function saveArticleLocalSettings(articleId: string, settings: ArticleLocalSettings): void {
	const map = readMap();
	map[articleId] = settings;
	writeMap(map);
}

export function removeArticleLocalSettings(articleId: string): void {
	const map = readMap();
	delete map[articleId];
	writeMap(map);
}
