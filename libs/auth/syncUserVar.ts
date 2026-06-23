import { userVar } from '../../apollo/store';

const PROFILE_IMAGE_STORAGE_PREFIX = 'fixora_profile_image:';

/** Sync Apollo reactive userVar from GraphQL User fields (settings / getUser). */
export function syncUserVarFromGraphqlUser(u: {
	_id?: string | null;
	userFullName?: string | null;
	userNickname?: string | null;
	userProfileImage?: string | null;
	userPhoneNumber?: string | null;
	userBio?: string | null;
}) {
	const current = userVar();
	userVar({
		...current,
		...(u.userFullName !== undefined ? { memberFullName: u.userFullName ?? '' } : {}),
		...(u.userNickname !== undefined ? { memberNick: u.userNickname ?? '' } : {}),
		...(u.userProfileImage !== undefined ? { memberImage: u.userProfileImage ?? '' } : {}),
		...(u.userPhoneNumber !== undefined ? { memberPhone: u.userPhoneNumber ?? '' } : {}),
		...(u.userBio !== undefined ? { memberDesc: u.userBio ?? '' } : {}),
	});

	if (typeof window !== 'undefined' && u._id && u.userProfileImage !== undefined) {
		const key = `${PROFILE_IMAGE_STORAGE_PREFIX}${u._id}`;
		if (u.userProfileImage) localStorage.setItem(key, u.userProfileImage);
		else localStorage.removeItem(key);
	}
}

export function readStoredProfileImage(userId: string): string | null {
	if (typeof window === 'undefined' || !userId) return null;
	return localStorage.getItem(`${PROFILE_IMAGE_STORAGE_PREFIX}${userId}`);
}
