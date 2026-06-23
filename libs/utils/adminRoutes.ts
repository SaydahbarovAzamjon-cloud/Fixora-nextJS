/** Valid Fixora admin console routes (pages router). */
export const ADMIN_HOME = '/_admin';

export const VALID_ADMIN_ROUTES = [
	'/_admin',
	'/_admin/verification',
	'/_admin/users',
	'/_admin/bookings',
	'/_admin/payments',
	'/_admin/devices',
	'/_admin/moderation',
	'/_admin/settings',
] as const;

export function isAdminRoute(pathname: string): boolean {
	return pathname.startsWith('/_admin') || pathname.startsWith('/admin');
}

const ADMIN_USER_DETAIL_RE = /^\/_admin\/users\/[a-f\d]{24}$/i;

export function isAdminUserDetailRoute(pathname: string): boolean {
	const normalized = pathname.replace(/\/$/, '');
	return ADMIN_USER_DETAIL_RE.test(normalized);
}

export function isValidAdminRoute(pathname: string): boolean {
	const normalized = pathname.replace(/\/$/, '') || '/_admin';
	if ((VALID_ADMIN_ROUTES as readonly string[]).includes(normalized)) return true;
	return isAdminUserDetailRoute(normalized);
}

export function normalizeAdminPath(pathname: string): string {
	if (pathname.startsWith('/admin')) {
		return pathname.replace(/^\/admin/, '/_admin') || '/_admin';
	}
	return pathname;
}
