import { REACT_APP_API_URL } from '../config';

/** Parse stored deviceImage (single path or JSON array string). */
export function parseDeviceImagePaths(deviceImage?: string | null): string[] {
	if (!deviceImage || deviceImage.trim() === '') return [];
	const trimmed = deviceImage.trim();
	if (trimmed.startsWith('[')) {
		try {
			const parsed = JSON.parse(trimmed) as unknown;
			if (Array.isArray(parsed)) {
				return parsed.filter((item): item is string => typeof item === 'string' && item.trim() !== '');
			}
		} catch {
			return [trimmed];
		}
	}
	return [trimmed];
}

/** Serialize uploaded paths for createDevice (single path stays plain string). */
export function serializeDeviceImages(paths: string[]): string | undefined {
	const clean = paths.map((path) => path.trim()).filter(Boolean);
	if (clean.length === 0) return undefined;
	if (clean.length === 1) return clean[0];
	return JSON.stringify(clean);
}

export function resolveDeviceImageUrl(image?: string | null): string | null {
	if (!image || image.trim() === '') return null;
	if (image.startsWith('blob:') || image.startsWith('data:')) return image;
	if (image.startsWith('http://') || image.startsWith('https://')) return image;
	if (image.startsWith('/img/') || image.startsWith('/public/')) return image;

	const base = REACT_APP_API_URL?.replace(/\/$/, '') ?? '';
	if (!base || base === 'undefined') {
		return image.startsWith('/') ? image : `/${image.replace(/^\//, '')}`;
	}
	return `${base}/${image.replace(/^\//, '')}`;
}

export const MAX_DEVICE_IMAGES = 3;

export function mergeDeviceImages(existing: string[], added: string[]): string | undefined {
	return serializeDeviceImages([...existing, ...added].slice(0, MAX_DEVICE_IMAGES));
}

export function getPrimaryDeviceImageUrl(deviceImage?: string | null): string | null {
	const paths = parseDeviceImagePaths(deviceImage);
	return paths.length > 0 ? resolveDeviceImageUrl(paths[0]) : null;
}
