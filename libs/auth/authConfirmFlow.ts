/** Marks auth UX as finished so admin monitor can fire after landing. */
export const AUTH_CONFIRM_PENDING_KEY = 'fixora_auth_confirm_pending';

export function setAuthConfirmPending(): void {
	if (typeof sessionStorage === 'undefined') return;
	sessionStorage.setItem(AUTH_CONFIRM_PENDING_KEY, '1');
}

export function clearAuthConfirmPending(): void {
	if (typeof sessionStorage === 'undefined') return;
	sessionStorage.removeItem(AUTH_CONFIRM_PENDING_KEY);
}

export function isAuthConfirmPending(): boolean {
	if (typeof sessionStorage === 'undefined') return false;
	return sessionStorage.getItem(AUTH_CONFIRM_PENDING_KEY) === '1';
}

/** Settled destinations where admin signup/login alerts should fire. */
export function isAuthSettledLandingPath(pathname: string): boolean {
	if (pathname === '/') return true;
	if (pathname === '/technician/dashboard') return true;
	if (pathname === '/register/technician/pending') return true;
	if (pathname.startsWith('/_admin')) return true;
	return false;
}
