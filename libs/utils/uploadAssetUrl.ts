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

/**
 * Resolve a GraphQL upload path (relative or absolute) to a browser URL.
 * In the browser, use same-origin `/uploads/...` so Next (dev) or nginx (prod)
 * can proxy to the API that stored the file.
 */
export function resolveUploadAssetUrl(image?: string | null): string | null {
	if (!image || image.trim() === '') return null;
	const value = image.trim();
	if (value.startsWith('http://') || value.startsWith('https://')) {
		try {
			const parsed = new URL(value);
			if (parsed.pathname.startsWith('/uploads/')) {
				const host = parsed.hostname;
				const isLocalHost = host === 'localhost' || host === '127.0.0.1';
				const sameHost =
					typeof window !== 'undefined' && host === window.location.hostname;
				if (isLocalHost || sameHost) {
					return `${parsed.pathname}${parsed.search}`;
				}
			}
		} catch {
			return value;
		}
		return value;
	}
	if (value.startsWith('blob:') || value.startsWith('data:')) return value;
	if (value.startsWith('/img/') || value.startsWith('/public/')) return value;

	const encoded = encodeUploadAssetPath(value.replace(/^\//, ''));
	// Browser: same-origin `/uploads/...` so Next (dev) or nginx (prod) proxies
	// to the same API that received imageUploader — not a stale localhost:2000.
	if (typeof window !== 'undefined') return `/${encoded}`;

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
