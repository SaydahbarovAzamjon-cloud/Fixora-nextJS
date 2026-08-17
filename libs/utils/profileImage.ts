import { REACT_APP_API_URL } from '../config';
import { resolveUploadAssetUrl } from './uploadAssetUrl';

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

/** OAuth provider CDN avatars (Google/Kakao/Apple) — not Fixora uploads. */
export function isRemoteHttpProfileImage(image?: string | null): boolean {
	if (!image) return false;
	const v = image.trim();
	return v.startsWith('http://') || v.startsWith('https://');
}

/** Local Fixora upload path (`uploads/member/...`), blob, or data URL. */
export function isLocalUploadedProfileImage(image?: string | null): boolean {
	if (!hasRealProfileImage(image)) return false;
	const v = image!.trim();
	if (v.startsWith('blob:') || v.startsWith('data:')) return true;
	if (isRemoteHttpProfileImage(v)) return false;
	return true;
}

/**
 * Prefer a user-uploaded Fixora path over an OAuth CDN avatar.
 * Never let Gmail/Kakao picture replace a previously saved upload.
 */
export function resolvePreferredProfileImage(
	incoming?: string | null,
	stored?: string | null,
): string {
	const a = incoming?.trim() || '';
	const b = stored?.trim() || '';
	if (isLocalUploadedProfileImage(b) && (isRemoteHttpProfileImage(a) || !a)) return b;
	if (isLocalUploadedProfileImage(a)) return a;
	if (isLocalUploadedProfileImage(b)) return b;
	return a || b || '';
}

/** Resolve profile image path from JWT, GraphQL, or legacy member fields. */
export function resolveProfileImageUrl(image?: string | null): string {
	if (!hasRealProfileImage(image)) return DEFAULT_AVATAR;
	if (image!.startsWith('blob:') || image!.startsWith('data:')) return image!;
	if (image!.startsWith('http://') || image!.startsWith('https://')) return image!;
	if (image!.startsWith('/img/') || image!.startsWith('/public/')) return image!;
	if (image === DEFAULT_AVATAR) return DEFAULT_AVATAR;

	return resolveUploadAssetUrl(image) ?? DEFAULT_AVATAR;
}
