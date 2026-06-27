/** JWT storage helpers — no Apollo imports (breaks auth ↔ apollo/client cycle). */

export function getJwtToken(): string {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken') ?? '';
	}
	return '';
}

export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token);
}

export function updateAuthStorage(jwtToken: string) {
	setJwtToken(jwtToken);
	window.localStorage.setItem('login', Date.now().toString());
}

export function clearAuthStorage() {
	localStorage.removeItem('accessToken');
	window.localStorage.setItem('logout', Date.now().toString());
}
