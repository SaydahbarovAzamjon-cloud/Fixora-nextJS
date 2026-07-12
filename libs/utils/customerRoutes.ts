export const TECHNICIAN_PORTAL_HOME = '/technician/dashboard';

import { isAdminRoute } from './adminRoutes';

/** Customer-only routes — technicians are redirected to the technician portal. */
export function isCustomerOnlyRoute(pathname: string): boolean {
	if (pathname.startsWith('/mypage')) return true;
	if (pathname.startsWith('/client/my-page')) return true;
	if (pathname === '/messages') return true;
	if (pathname === '/notifications') return true;
	if (/^\/technicians\/[^/]+\/book$/.test(pathname)) return true;
	return false;
}

export function isTechnicianAllowedRoute(pathname: string): boolean {
	if (isAdminRoute(pathname)) return true;
	return ['/technician', '/login', '/register', '/account', '/onboarding'].some((prefix) =>
		pathname.startsWith(prefix),
	);
}

/** Logged-in technicians may only use the technician portal (+ auth routes). */
export function isTechnicianPortalRedirectRoute(pathname: string): boolean {
	return !isTechnicianAllowedRoute(pathname);
}

export function getTechnicianPortalRedirect(pathname: string, userId?: string | null): string {
	const ownPublicProfile = pathname.match(/^\/technicians\/([^/]+)$/);
	if (ownPublicProfile && userId && ownPublicProfile[1] === userId) {
		return '/technician/profile';
	}
	return TECHNICIAN_PORTAL_HOME;
}

/** Full-page redirect — avoids mixed public + technician DOM during client transitions. */
export function redirectTechnicianToPortal(pathname: string, userId?: string | null): void {
	if (typeof window === 'undefined') return;
	const target = getTechnicianPortalRedirect(pathname, userId);
	const current = window.location.pathname;
	if (current === target) return;
	window.location.replace(target);
}

/** Layout scope for route transitions — forces a clean remount between public and technician trees. */
export function getRouteLayoutScope(pathname: string): 'technician' | 'admin' | 'public' {
	if (pathname.startsWith('/technician')) return 'technician';
	if (isAdminRoute(pathname)) return 'admin';
	return 'public';
}
