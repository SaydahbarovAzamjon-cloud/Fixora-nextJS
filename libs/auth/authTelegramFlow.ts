/** Blocks LayoutAuth auto-redirect while post-login Telegram connect step is active. */
export const AUTH_TELEGRAM_PENDING_KEY = 'fixora_auth_telegram_pending';

export function setAuthTelegramPending(): void {
	if (typeof sessionStorage === 'undefined') return;
	sessionStorage.setItem(AUTH_TELEGRAM_PENDING_KEY, '1');
}

export function clearAuthTelegramPending(): void {
	if (typeof sessionStorage === 'undefined') return;
	sessionStorage.removeItem(AUTH_TELEGRAM_PENDING_KEY);
}

export function isAuthTelegramPending(): boolean {
	if (typeof sessionStorage === 'undefined') return false;
	return sessionStorage.getItem(AUTH_TELEGRAM_PENDING_KEY) === '1';
}
