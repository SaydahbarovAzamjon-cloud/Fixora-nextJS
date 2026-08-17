import { getApiBaseUrl } from '../env/publicEnv';

/** Encode each path segment so names with spaces/unicode still load. */
export function encodeUploadAssetPath(relativePath: string): string {
	return relativePath
		.replace(/\\/g, '/')
		.split('/')
		.filter(Boolean)
		.map((segment) => encodeURIComponent(segment))
		.join('/');
}

function isBrowserNonLocalhost(): boolean {
	if (typeof window === 'undefined') return false;
	const host = window.location.hostname;
	return host !== 'localhost' && host !== '127.0.0.1';
}

/**
 * Resolve a GraphQL upload path (relative or absolute) to a browser URL.
 * On the public site, use same-origin `/uploads/...` so nginx can proxy it.
 */
export function resolveUploadAssetUrl(image?: string | null): string | null {
	if (!image || image.trim() === '') return null;
	const value = image.trim();
	if (value.startsWith('http://') || value.startsWith('https://')) return value;
	if (value.startsWith('blob:') || value.startsWith('data:')) return value;
	if (value.startsWith('/img/') || value.startsWith('/public/')) return value;

	const encoded = encodeUploadAssetPath(value.replace(/^\//, ''));
	if (isBrowserNonLocalhost()) return `/${encoded}`;

	const base = getApiBaseUrl()?.replace(/\/$/, '') ?? '';
	if (!base || base === 'undefined') return `/${encoded}`;
	return `${base}/${encoded}`;
}

/** Older article covers were stored as uploads/article/X but the file lives in member/. */
export function memberFallbackUploadPath(relativePath: string): string | null {
	const normalized = relativePath.replace(/\\/g, '/').replace(/^\//, '');
	if (!normalized.includes('/article/')) return null;
	return normalized.replace('/article/', '/member/');
}
