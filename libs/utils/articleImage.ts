import { REACT_APP_API_URL } from '../config';

/** Resolve article cover path from GraphQL (relative or absolute). Returns null when missing. */
export function resolveArticleImageUrl(image?: string | null): string | null {
	if (!image || image.trim() === '') return null;
	if (image.startsWith('http://') || image.startsWith('https://')) return image;
	if (image.startsWith('/img/') || image.startsWith('/public/')) return image;

	const base = REACT_APP_API_URL?.replace(/\/$/, '') ?? '';
	if (!base || base === 'undefined') {
		return image.startsWith('/') ? image : `/${image.replace(/^\//, '')}`;
	}
	return `${base}/${image.replace(/^\//, '')}`;
}
