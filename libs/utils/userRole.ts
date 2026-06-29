import { CustomJwtPayload } from '../types/customJwtPayload';

export type FixoraUserRole = 'USER' | 'TECHNICIAN' | 'ADMIN';

type AuthUser = Partial<CustomJwtPayload> | null | undefined;

export function getUserRole(user: AuthUser): FixoraUserRole | null {
	const role = user?.userType ?? user?.memberType;
	if (role === 'USER' || role === 'TECHNICIAN' || role === 'ADMIN') {
		return role;
	}
	return null;
}

export function isTechnicianUser(user: AuthUser): boolean {
	return getUserRole(user) === 'TECHNICIAN';
}

export function isAdminUser(user: AuthUser): boolean {
	return getUserRole(user) === 'ADMIN';
}

export function isCustomerUser(user: AuthUser): boolean {
	return getUserRole(user) === 'USER';
}

export function isRoleRestrictedError(message: string): boolean {
	return /access is restricted|specific roles/i.test(message);
}

export function isMissingTokenError(message: string): boolean {
	return /authorization token is missing|token is missing|not authenticated|unauthorized/i.test(message);
}

export function isSessionExpiredError(message: string): boolean {
	return /jwt expired|token expired|invalid token|session (has )?expired|session_revoked/i.test(message);
}

export function shouldRedirectToLogin(message: string): boolean {
	return isSessionExpiredError(message);
}
