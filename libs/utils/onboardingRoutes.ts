export const ONBOARDING_CUSTOMER_PATH = '/onboarding/customer';
export const ONBOARDING_TECHNICIAN_PATH = '/onboarding/technician';

export function isPostSignupOnboardingRoute(pathname: string): boolean {
	return pathname === ONBOARDING_CUSTOMER_PATH || pathname === ONBOARDING_TECHNICIAN_PATH;
}

/** Routes that may be visited while post-signup onboarding is still pending. */
export function isOnboardingGuardExemptRoute(pathname: string): boolean {
	if (isPostSignupOnboardingRoute(pathname)) return true;
	if (pathname.startsWith('/login')) return true;
	if (pathname.startsWith('/register')) return true;
	return false;
}
