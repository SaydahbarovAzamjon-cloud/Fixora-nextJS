import { REACT_APP_API_URL } from '../../config';

/** Resolve story image URL — relative paths get API origin prefix. */
export const storyImageUrl = (url?: string): string => {
	if (!url) return '';
	return url.startsWith('http') ? url : `${REACT_APP_API_URL}/${url}`;
};

/** Sort story frames by order field. */
export const sortedStoryImages = (images: { url: string; order: number }[]) =>
	[...images].sort((a, b) => a.order - b.order);
