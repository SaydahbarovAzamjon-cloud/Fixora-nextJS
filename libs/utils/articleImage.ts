import { memberFallbackUploadPath, resolveUploadAssetUrl } from './uploadAssetUrl';

export { encodeUploadAssetPath, resolveUploadAssetUrl } from './uploadAssetUrl';

/** Resolve article cover path from GraphQL (relative or absolute). Returns null when missing. */
export function resolveArticleImageUrl(image?: string | null): string | null {
	return resolveUploadAssetUrl(image);
}

/** Same filename under uploads/member when the article folder 404s. */
export function articleImageFallbackUrl(image?: string | null): string | null {
	if (!image || image.trim() === '') return null;
	const fallbackPath = memberFallbackUploadPath(image.trim());
	if (!fallbackPath) return null;
	return resolveUploadAssetUrl(fallbackPath);
}
