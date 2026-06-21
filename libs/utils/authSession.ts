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
		if (!claims._id) return null;
		const role = claims.userType ?? claims.memberType;
		return {
			_id: claims._id,
			memberType: role,
			userType: role,
		};
	} catch {
		return null;
	}
}
