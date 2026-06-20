import { CustomJwtPayload } from '../types/customJwtPayload';
import { getUserRole, isAdminUser, isTechnicianUser } from './userRole';

type AuthUser = Partial<CustomJwtPayload> | null | undefined;

export { isTechnicianUser, isAdminUser, getUserRole, isCustomerUser, isRoleRestrictedError, isMissingTokenError } from './userRole';
export type { FixoraUserRole } from './userRole';

/** Default destination after login/signup — not used to block `/` for logged-in users. */
export function getPostAuthRoute(user: AuthUser, referrer?: string | null): string {
	if (isAdminUser(user)) return '/_admin';
	if (isTechnicianUser(user)) return '/technician/dashboard';
	if (referrer && referrer !== '/') return referrer;
	return '/mypage';
}
