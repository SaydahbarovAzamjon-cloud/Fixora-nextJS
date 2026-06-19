import { userVar } from '../../apollo/store';

/** Sync Apollo reactive userVar from GraphQL User fields (settings / getUser). */
export function syncUserVarFromGraphqlUser(u: {
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
}
