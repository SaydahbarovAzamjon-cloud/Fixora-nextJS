import { clearAuthStorage } from './tokens';
import { deleteUserInfo } from './userInfo';

let redirecting = false;

/** Clear client session and send the user to login (no Apollo import — safe from error link). */
export function handleSessionExpired(): void {
	if (typeof window === 'undefined' || redirecting) return;

	redirecting = true;
	clearAuthStorage();
	deleteUserInfo();

	const loginPath = '/login';
	if (window.location.pathname === loginPath) {
		redirecting = false;
		return;
	}

	window.location.href = loginPath;
}
