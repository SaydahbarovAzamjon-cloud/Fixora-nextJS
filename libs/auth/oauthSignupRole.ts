/** Preserves customer vs technician choice across OAuth sign-up (sessionStorage). */

export const OAUTH_SIGNUP_ROLE_KEY = 'fixora_oauth_signup_role';

export type OAuthSignupRole = 'USER' | 'TECHNICIAN';

export function saveOAuthSignupRole(role: OAuthSignupRole): void {
	if (typeof window === 'undefined') return;
	sessionStorage.setItem(OAUTH_SIGNUP_ROLE_KEY, role);
}

export function readOAuthSignupRole(): OAuthSignupRole | null {
	if (typeof window === 'undefined') return null;
	const raw = sessionStorage.getItem(OAUTH_SIGNUP_ROLE_KEY);
	return raw === 'USER' || raw === 'TECHNICIAN' ? raw : null;
}

export function clearOAuthSignupRole(): void {
	if (typeof window === 'undefined') return;
	sessionStorage.removeItem(OAUTH_SIGNUP_ROLE_KEY);
}
