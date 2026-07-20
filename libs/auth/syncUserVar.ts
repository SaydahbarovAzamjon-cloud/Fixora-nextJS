import { userVar } from '../../apollo/store';
import { isLocalUploadedProfileImage, resolvePreferredProfileImage } from '../utils/profileImage';

const PROFILE_IMAGE_STORAGE_PREFIX = 'fixora_profile_image:';

/** Sync Apollo reactive userVar from GraphQL User fields (settings / getUser). */
export function syncUserVarFromGraphqlUser(u: {
	_id?: string | null;
	userFullName?: string | null;
	userNickname?: string | null;
	userProfileImage?: string | null;
	userPhoneNumber?: string | null;
	userLocation?: string | null;
	userBio?: string | null;
}) {
	const current = userVar();
	const nextFullName = u.userFullName !== undefined ? (u.userFullName ?? '') : (current.memberFullName ?? '');
	const nextNick = u.userNickname !== undefined ? (u.userNickname ?? '') : (current.memberNick ?? '');
	const storedImage = u._id ? readStoredProfileImage(u._id) : null;
	// Explicit GraphQL/save path: trust a new Fixora upload over stale localStorage/JWT.
	const nextImage =
		u.userProfileImage !== undefined
			? isLocalUploadedProfileImage(u.userProfileImage)
				? (u.userProfileImage ?? '').trim()
				: resolvePreferredProfileImage(u.userProfileImage, storedImage ?? current.memberImage)
			: (current.memberImage ?? '');
	const nextPhone = u.userPhoneNumber !== undefined ? (u.userPhoneNumber ?? '') : (current.memberPhone ?? '');
	const nextLocation = u.userLocation !== undefined ? (u.userLocation ?? '') : (current.memberAddress ?? '');
	const nextBio = u.userBio !== undefined ? (u.userBio ?? '') : (current.memberDesc ?? '');

	const unchanged =
		nextFullName === (current.memberFullName ?? '') &&
		nextNick === (current.memberNick ?? '') &&
		nextImage === (current.memberImage ?? '') &&
		nextPhone === (current.memberPhone ?? '') &&
		nextLocation === (current.memberAddress ?? '') &&
		nextBio === (current.memberDesc ?? '');

	if (unchanged) return;

	userVar({
		...current,
		...(u.userFullName !== undefined ? { memberFullName: nextFullName } : {}),
		...(u.userNickname !== undefined ? { memberNick: nextNick } : {}),
		...(u.userProfileImage !== undefined ? { memberImage: nextImage } : {}),
		...(u.userPhoneNumber !== undefined ? { memberPhone: nextPhone } : {}),
		...(u.userLocation !== undefined ? { memberAddress: nextLocation } : {}),
		...(u.userBio !== undefined ? { memberDesc: nextBio } : {}),
	});

	if (typeof window !== 'undefined' && u._id && u.userProfileImage !== undefined) {
		const key = `${PROFILE_IMAGE_STORAGE_PREFIX}${u._id}`;
		if (nextImage) localStorage.setItem(key, nextImage);
		else localStorage.removeItem(key);
	}
}

export function readStoredProfileImage(userId: string): string | null {
	if (typeof window === 'undefined' || !userId) return null;
	return localStorage.getItem(`${PROFILE_IMAGE_STORAGE_PREFIX}${userId}`);
}

export function writeStoredProfileImage(userId: string, imagePath: string | null | undefined) {
	if (typeof window === 'undefined' || !userId) return;
	const key = `${PROFILE_IMAGE_STORAGE_PREFIX}${userId}`;
	if (imagePath) localStorage.setItem(key, imagePath);
	else localStorage.removeItem(key);
}
