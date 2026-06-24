import decodeJWT from 'jwt-decode';
import { userVar } from '../../apollo/store';
import { getJwtToken } from '../auth';
import { CustomJwtPayload } from '../types/customJwtPayload';

type SessionUser = Partial<CustomJwtPayload>;

/** Reactive userVar when hydrated, otherwise decode JWT for immediate role checks. */
export function resolveAuthUser(): SessionUser | null {
	const current = userVar();
	if (current?._id) return current;

	const jwt = getJwtToken();
	if (!jwt) return null;

	try {
		const claims = decodeJWT<CustomJwtPayload>(jwt);
		const userId = claims._id ?? (claims as { sub?: string }).sub;
		if (!userId) return null;
		const role = claims.userType ?? claims.memberType;
		return {
			_id: userId,
			memberType: role,
			userType: role,
			verificationStatus: claims.verificationStatus,
			memberFullName: claims.userFullName ?? claims.memberFullName,
			memberNick: claims.userNickname ?? claims.memberNick,
			memberImage: claims.userProfileImage ?? claims.memberImage,
		};
	} catch {
		return null;
	}
}
