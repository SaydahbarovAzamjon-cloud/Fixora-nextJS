import decodeJWT from 'jwt-decode';
import { userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { readStoredProfileImage } from './syncUserVar';

export const updateUserInfo = (jwtToken: string | null | undefined): boolean => {
	if (!jwtToken) return false;

	const claims = decodeJWT<CustomJwtPayload>(jwtToken);
	const userId = claims._id ?? (claims as { sub?: string }).sub ?? '';
	const storedImage = userId ? readStoredProfileImage(userId) : null;
	const profileImage = storedImage ?? claims.userProfileImage ?? claims.memberImage ?? '';
	userVar({
		_id: userId,
		memberType: claims.userType ?? claims.memberType ?? '',
		userType: claims.userType ?? claims.memberType ?? '',
		verificationStatus: claims.verificationStatus,
		memberStatus: claims.memberStatus ?? '',
		memberAuthType: claims.memberAuthType,
		memberPhone: claims.memberPhone ?? '',
		memberNick: claims.userNickname ?? claims.memberNick ?? '',
		memberFullName: claims.userFullName ?? claims.memberFullName ?? '',
		memberImage: profileImage ? `${profileImage}` : '',
		memberAddress: claims.memberAddress ?? '',
		memberDesc: claims.memberDesc ?? '',
		memberProperties: claims.memberProperties,
		memberRank: claims.memberRank,
		memberArticles: claims.memberArticles,
		memberPoints: claims.memberPoints,
		memberLikes: claims.memberLikes,
		memberViews: claims.memberViews,
		memberWarnings: claims.memberWarnings,
		memberBlocks: claims.memberBlocks,
	});
	return true;
};

export const deleteUserInfo = () => {
	userVar({
		_id: '',
		memberType: '',
		memberStatus: '',
		memberAuthType: '',
		memberPhone: '',
		memberNick: '',
		memberFullName: '',
		memberImage: '',
		memberAddress: '',
		memberDesc: '',
		memberProperties: 0,
		memberRank: 0,
		memberArticles: 0,
		memberPoints: 0,
		memberLikes: 0,
		memberViews: 0,
		memberWarnings: 0,
		memberBlocks: 0,
	});
};
