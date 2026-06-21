import { CustomJwtPayload } from '../types/customJwtPayload';
import { isCustomerOnlyRoute, TECHNICIAN_PORTAL_HOME } from './customerRoutes';
import { isAdminUser, isTechnicianUser } from './userRole';

type AuthUser = Partial<CustomJwtPayload> | null | undefined;

export { isTechnicianUser, isAdminUser, getUserRole, isCustomerUser, isRoleRestrictedError, isMissingTokenError } from './userRole';
export type { FixoraUserRole } from './userRole';

/** Default destination after login/signup. Technicians always land on the technician portal. */
export function getPostAuthRoute(user: AuthUser, referrer?: string | null): string {
	if (isAdminUser(user)) return '/_admin';
	if (isTechnicianUser(user)) return TECHNICIAN_PORTAL_HOME;
	if (referrer && referrer !== '/' && !isCustomerOnlyRoute(referrer.split('?')[0])) return referrer;
	return '/mypage';
}
