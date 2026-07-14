import decodeJWT from 'jwt-decode';
import { userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { resolvePreferredProfileImage } from '../utils/profileImage';
import { readStoredProfileImage } from './syncUserVar';

export const updateUserInfo = (jwtToken: string | null | undefined): boolean => {
	if (!jwtToken) return false;

	try {
		const claims = decodeJWT<CustomJwtPayload>(jwtToken);
		const current = userVar();
		const userId = claims._id ?? (claims as { sub?: string }).sub ?? current._id ?? '';
		const role = claims.userType ?? claims.memberType ?? current.userType ?? current.memberType ?? '';
		const storedImage = userId ? readStoredProfileImage(userId) : null;
		const profileImage = resolvePreferredProfileImage(
			claims.userProfileImage ?? claims.memberImage ?? current.memberImage,
			storedImage,
		);

		userVar({
			...current,
			_id: userId || current._id,
			memberType: role,
			userType: role,
			verificationStatus: claims.verificationStatus ?? current.verificationStatus,
			memberStatus: claims.memberStatus ?? current.memberStatus ?? '',
			memberAuthType: claims.memberAuthType ?? current.memberAuthType ?? '',
			memberPhone: claims.memberPhone ?? current.memberPhone ?? '',
			memberNick: claims.userNickname ?? claims.memberNick ?? current.memberNick ?? '',
			memberFullName: claims.userFullName ?? claims.memberFullName ?? current.memberFullName ?? '',
			memberImage: profileImage ? `${profileImage}` : current.memberImage ?? '',
			memberAddress: claims.memberAddress ?? current.memberAddress ?? '',
			memberDesc: claims.memberDesc ?? current.memberDesc ?? '',
			memberProperties: claims.memberProperties ?? current.memberProperties ?? 0,
			memberRank: claims.memberRank ?? current.memberRank ?? 0,
			memberArticles: claims.memberArticles ?? current.memberArticles ?? 0,
			memberPoints: claims.memberPoints ?? current.memberPoints ?? 0,
			memberLikes: claims.memberLikes ?? current.memberLikes ?? 0,
			memberViews: claims.memberViews ?? current.memberViews ?? 0,
			memberWarnings: claims.memberWarnings ?? current.memberWarnings ?? 0,
			memberBlocks: claims.memberBlocks ?? current.memberBlocks ?? 0,
		});
		return Boolean(userId || current._id);
	} catch {
		return false;
	}
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
