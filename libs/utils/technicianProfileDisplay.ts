import { TechnicianProfile } from '../types/fixora/fixora';
import { readStoredProfileImage } from '../auth/syncUserVar';
import { hasRealProfileImage, resolveProfileImageUrl } from './profileImage';

const DEFAULT_NAME = 'Technician';

export type TechnicianNameFields = Pick<
	TechnicianProfile,
	'shopName' | 'userNickname' | 'userFullName'
>;

/** Public display name — shop/business first per product rule. */
export function getTechnicianDisplayName(profile?: TechnicianNameFields | null): string {
	if (!profile) return DEFAULT_NAME;
	return profile.shopName || profile.userNickname || profile.userFullName || DEFAULT_NAME;
}

/** Owner portal display name — matches technician header/sidebar (full name first). */
export function getTechnicianSelfDisplayName(profile?: TechnicianNameFields | null): string {
	if (!profile) return DEFAULT_NAME;
	return profile.userFullName?.trim() || profile.shopName?.trim() || profile.userNickname?.trim() || DEFAULT_NAME;
}

/** Person name under shop title when both exist and differ. */
export function getTechnicianOwnerSubtitle(profile?: TechnicianNameFields | null): string | null {
	if (!profile?.shopName) return null;
	const displayName = getTechnicianDisplayName(profile);
	const nickname = profile.userNickname?.trim();
	const fullName = profile.userFullName?.trim();
	if (nickname && nickname !== displayName) return nickname;
	if (fullName && fullName !== displayName) return fullName;
	return null;
}

/** Card label — @nickname when subtitle is the username. */
export function getTechnicianOwnerSubtitleLabel(profile?: TechnicianNameFields | null): string | null {
	const subtitle = getTechnicianOwnerSubtitle(profile);
	if (!subtitle) return null;
	const nickname = profile?.userNickname?.trim();
	if (nickname && subtitle === nickname) return `@${nickname}`;
	return subtitle;
}

export function getTechnicianAvatarUrl(
	profile?: TechnicianProfile | null,
	draftPreview?: string | null,
): string {
	if (draftPreview) return draftPreview;
	return resolveProfileImageUrl(profile?.userProfileImage);
}

/** Owner portal avatar — draft, profile, localStorage, then auth session fallback. */
export function getTechnicianSelfAvatarUrl(
	profile?: TechnicianProfile | null,
	draftPreview?: string | null,
	userId?: string | null,
	authImage?: string | null,
): string {
	if (draftPreview) return draftPreview;
	if (hasRealProfileImage(profile?.userProfileImage)) {
		return resolveProfileImageUrl(profile?.userProfileImage);
	}
	const stored = userId ? readStoredProfileImage(userId) : null;
	if (hasRealProfileImage(stored)) return resolveProfileImageUrl(stored);
	if (hasRealProfileImage(authImage)) return resolveProfileImageUrl(authImage);
	return resolveProfileImageUrl(profile?.userProfileImage);
}

export function initialsOf(value: string): string {
	const parts = value.trim().split(/\s+/);
	return ((parts[0]?.[0] || '?') + (parts[1]?.[0] || parts[0]?.[1] || '')).toUpperCase();
}
