import { REACT_APP_API_URL } from '../config';

const DEFAULT_AVATAR = '/img/profile/defaultUser.svg';

export function apiBaseUrl(): string {
	const fromConfig = REACT_APP_API_URL?.replace(/\/$/, '');
	if (fromConfig && fromConfig !== 'undefined') return fromConfig;
	return '';
}

export function hasRealProfileImage(image?: string | null): boolean {
	if (!image || image.trim() === '') return false;
	if (image.includes('defaultUser')) return false;
	return true;
}

/** Resolve profile image path from JWT, GraphQL, or legacy member fields. */
export function resolveProfileImageUrl(image?: string | null): string {
	if (!hasRealProfileImage(image)) return DEFAULT_AVATAR;
	if (image!.startsWith('blob:') || image!.startsWith('data:')) return image!;
	if (image!.startsWith('http://') || image!.startsWith('https://')) return image!;
	if (image!.startsWith('/img/') || image!.startsWith('/public/')) return image!;
	if (image === DEFAULT_AVATAR) return DEFAULT_AVATAR;

	const base = apiBaseUrl();
	if (!base) return image!.startsWith('/') ? image! : `/${image!}`;
	return `${base}/${image!.replace(/^\//, '')}`;
}
