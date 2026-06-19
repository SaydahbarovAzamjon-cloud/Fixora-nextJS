import { CustomJwtPayload } from '../types/customJwtPayload';

type AuthUser = Partial<CustomJwtPayload> | null | undefined;

export function isTechnicianUser(user: AuthUser): boolean {
	return user?.memberType === 'TECHNICIAN' || user?.userType === 'TECHNICIAN';
}

export function isAdminUser(user: AuthUser): boolean {
	return user?.memberType === 'ADMIN' || user?.userType === 'ADMIN';
}

/** Default destination after login/signup — not used to block `/` for logged-in users. */
export function getPostAuthRoute(user: AuthUser, referrer?: string | null): string {
	if (isAdminUser(user)) return '/_admin';
	if (isTechnicianUser(user)) return '/technician/dashboard';
	if (referrer && referrer !== '/') return referrer;
	return '/mypage';
}
