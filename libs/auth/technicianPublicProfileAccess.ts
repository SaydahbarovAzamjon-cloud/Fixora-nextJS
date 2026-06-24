import { CustomJwtPayload } from '../types/customJwtPayload';

type AuthSlice = Partial<CustomJwtPayload> | null | undefined;

/** Public `getUser` only returns APPROVED technicians (FRONTEND_API.md). */
export function shouldSkipPublicGetUser(auth: AuthSlice): boolean {
	if (!auth?._id) return false;
	const role = auth.userType ?? auth.memberType;
	if (role !== 'TECHNICIAN') return false;
	const status = auth.verificationStatus;
	if (!status) return false;
	return status !== 'APPROVED';
}
