import { CustomJwtPayload } from '../types/customJwtPayload';
import {
	getPostSignupOnboardingStatus,
	needsPostSignupOnboarding,
} from '../auth/postSignupOnboarding';
import { getPostAuthRoute } from './postAuthRoute';
import { isTechnicianUser } from './userRole';

type AuthUser = Partial<CustomJwtPayload> | null | undefined;

export function getPostSignupOnboardingPath(user: AuthUser): string {
	return isTechnicianUser(user) ? '/onboarding/technician' : '/onboarding/customer';
}

/** Next route after login/signup — onboarding first when still pending. */
export function resolvePostAuthDestination(user: AuthUser, referrer?: string | null): string {
	if (user?._id && needsPostSignupOnboarding(user._id)) {
		return getPostSignupOnboardingPath(user);
	}
	return getPostAuthRoute(user, referrer);
}

export function getTechnicianAfterOnboardingPath(user: AuthUser): string {
	if (user?.verificationStatus === 'APPROVED') {
		return getPostAuthRoute(user);
	}
	return '/register/technician/pending';
}

export { getPostSignupOnboardingStatus };
