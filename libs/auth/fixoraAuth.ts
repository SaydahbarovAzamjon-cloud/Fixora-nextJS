import { initializeApollo } from '../../apollo/client';
import {
	COMPLETE_OAUTH_SIGNUP,
	FIXORA_LOGIN,
	FIXORA_SIGNUP,
	LOGIN_WITH_OAUTH,
} from '../../apollo/user/auth';
import { userVar } from '../../apollo/store';
import { updateUserInfo } from './index';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getGraphQLErrorMessage(err: unknown): string {
	const anyErr = err as { graphQLErrors?: { message?: string }[]; message?: string };
	if (anyErr?.graphQLErrors?.[0]?.message) return anyErr.graphQLErrors[0].message;
	if (anyErr?.message) return anyErr.message;
	return 'Request failed';
}

export interface AuthValidationResult {
	valid: boolean;
	errors: Record<string, string>;
}

export type AuthProvider = 'GOOGLE' | 'KAKAO' | 'APPLE';

export interface OAuthLoginResult {
	needsOnboarding: boolean;
	userType?: string;
}

export const validateEmail = (email: string): boolean => EMAIL_RE.test(email.trim());

export const validateLoginInput = (email: string, password: string): AuthValidationResult => {
	const errors: Record<string, string> = {};
	if (!email.trim()) errors.email = 'emailRequired';
	else if (!validateEmail(email)) errors.email = 'emailInvalid';
	if (!password) errors.password = 'passwordRequired';
	return { valid: Object.keys(errors).length === 0, errors };
};

export const validateRegisterInput = (
	fullName: string,
	email: string,
	password: string,
	confirmPassword: string,
	termsAccepted: boolean,
): AuthValidationResult => {
	const errors: Record<string, string> = {};
	if (!fullName.trim()) errors.fullName = 'nameRequired';
	if (!email.trim()) errors.email = 'emailRequired';
	else if (!validateEmail(email)) errors.email = 'emailInvalid';
	if (!password) errors.password = 'passwordRequired';
	else if (password.length < 5) errors.password = 'passwordMin';
	else if (password.length > 12) errors.password = 'passwordMax';
	if (password !== confirmPassword) errors.confirmPassword = 'passwordMismatch';
	if (!termsAccepted) errors.terms = 'termsRequired';
	return { valid: Object.keys(errors).length === 0, errors };
};

export const validateTechStep1 = (
	fullName: string,
	email: string,
	phone: string,
): AuthValidationResult => {
	const errors: Record<string, string> = {};
	if (!fullName.trim()) errors.fullName = 'nameRequired';
	if (!email.trim()) errors.email = 'emailRequired';
	else if (!validateEmail(email)) errors.email = 'emailInvalid';
	if (phone.trim() && phone.trim().length < 8) errors.phone = 'phoneInvalid';
	return { valid: Object.keys(errors).length === 0, errors };
};

export const validateOAuthCompleteInput = (
	nickname: string,
	phone: string,
	termsAccepted: boolean,
): AuthValidationResult => {
	const errors: Record<string, string> = {};
	if (!nickname.trim() || nickname.trim().length < 3) errors.nickname = 'nameRequired';
	if (!phone.trim() || phone.trim().length < 8) errors.phone = 'phoneInvalid';
	if (!termsAccepted) errors.terms = 'termsRequired';
	return { valid: Object.keys(errors).length === 0, errors };
};

export interface FixoraAuthProfile {
	userProfileImage?: string | null;
	userNickname?: string | null;
	userFullName?: string | null;
	userType?: string | null;
}

export function setAuthTokens(accessToken: string, refreshToken: string, profile?: FixoraAuthProfile) {
	if (typeof window === 'undefined') return;
	localStorage.setItem('accessToken', accessToken);
	localStorage.setItem('refreshToken', refreshToken);
	localStorage.setItem('login', Date.now().toString());
	updateUserInfo(accessToken);
	if (profile) {
		const current = userVar();
		userVar({
			...current,
			...(profile.userProfileImage ? { memberImage: profile.userProfileImage } : {}),
			...(profile.userNickname ? { memberNick: profile.userNickname } : {}),
			...(profile.userFullName ? { memberFullName: profile.userFullName } : {}),
			...(profile.userType ? { memberType: profile.userType } : {}),
		});
	}
}

export function setNeedsOnboarding(value: boolean) {
	if (typeof window === 'undefined') return;
	if (value) localStorage.setItem('needsOnboarding', '1');
	else localStorage.removeItem('needsOnboarding');
}

export function getNeedsOnboarding(): boolean {
	if (typeof window === 'undefined') return false;
	return localStorage.getItem('needsOnboarding') === '1';
}

export const fixoraLogin = async (userEmail: string, userPassword: string): Promise<void> => {
	const apolloClient = await initializeApollo();
	try {
		const result = await apolloClient.mutate({
			mutation: FIXORA_LOGIN,
			variables: { input: { userEmail: userEmail.trim(), userPassword } },
			fetchPolicy: 'network-only',
		});
		const user = result.data?.login;
		if (!user?.accessToken) {
			throw new Error('Login failed — no access token returned');
		}
		setAuthTokens(user.accessToken, user.refreshToken ?? '', {
			userProfileImage: user.userProfileImage,
			userNickname: user.userNickname,
			userFullName: user.userFullName,
			userType: user.userType,
		});
		setNeedsOnboarding(false);
	} catch (err) {
		throw new Error(getGraphQLErrorMessage(err));
	}
};

export const fixoraCustomerSignup = async (
	fullName: string,
	userEmail: string,
	userPassword: string,
	userPhone = '',
): Promise<void> => {
	const nickname = fullName.trim().replace(/\s+/g, '').slice(0, 12) || userEmail.split('@')[0].slice(0, 12);
	const apolloClient = await initializeApollo();
	try {
		const result = await apolloClient.mutate({
			mutation: FIXORA_SIGNUP,
			variables: {
				input: {
					userEmail: userEmail.trim(),
					userNickname: nickname,
					userPassword,
					userPhoneNumber: userPhone.trim() || '01000000000',
					userType: 'USER',
					termsAcceptedAt: new Date().toISOString(),
				},
			},
			fetchPolicy: 'network-only',
		});
		const user = result.data?.signup;
		if (!user?.accessToken) {
			throw new Error('Sign up failed — no access token returned');
		}
		setAuthTokens(user.accessToken, user.refreshToken ?? '', {
			userProfileImage: user.userProfileImage,
			userNickname: user.userNickname,
			userFullName: user.userFullName,
			userType: user.userType,
		});
		setNeedsOnboarding(false);
	} catch (err) {
		throw new Error(getGraphQLErrorMessage(err));
	}
};

export const fixoraOAuthLogin = async (
	authProvider: AuthProvider,
	token: string,
): Promise<OAuthLoginResult> => {
	const apolloClient = await initializeApollo();
	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN_WITH_OAUTH,
			variables: { input: { authProvider, token } },
			fetchPolicy: 'network-only',
		});

		const payload = result.data?.loginWithOAuth;
		if (!payload?.accessToken) {
			throw new Error('OAuth login failed — no access token returned');
		}

		setAuthTokens(payload.accessToken, payload.refreshToken ?? '', {
			userProfileImage: payload.user?.userProfileImage,
			userNickname: payload.user?.userNickname,
			userFullName: payload.user?.userFullName,
			userType: payload.user?.userType,
		});
		setNeedsOnboarding(!!payload.needsOnboarding);

		return {
			needsOnboarding: !!payload.needsOnboarding,
			userType: payload.user?.userType,
		};
	} catch (err) {
		throw new Error(getGraphQLErrorMessage(err));
	}
};

export const fixoraCompleteOAuthSignup = async (input: {
	userNickname: string;
	userPhoneNumber: string;
	userType: 'USER' | 'TECHNICIAN';
	userEmail?: string;
}): Promise<string> => {
	const apolloClient = await initializeApollo();
	const result = await apolloClient.mutate({
		mutation: COMPLETE_OAUTH_SIGNUP,
		variables: {
			input: {
				...input,
				termsAcceptedAt: new Date().toISOString(),
			},
		},
		fetchPolicy: 'network-only',
	});

	const user = result.data?.completeOAuthSignup;
	if (!user?.accessToken) throw new Error('OAuth signup completion failed');

	setAuthTokens(user.accessToken, user.refreshToken ?? '', {
		userNickname: user.userNickname,
		userFullName: user.userFullName,
		userType: user.userType,
	});
	setNeedsOnboarding(false);
	return user.userType;
};

/** Technician signup draft — stores multi-step data */
export const TECH_DRAFT_KEY = 'fixora_tech_onboarding_draft';

export interface TechOnboardingDraft {
	fullName: string;
	email: string;
	phone: string;
	photoFileName?: string;
	photoDataUrl?: string;
	idFileName?: string;
	idPreviewDataUrl?: string;
}

export const saveTechDraft = (draft: TechOnboardingDraft) => {
	if (typeof window !== 'undefined') {
		sessionStorage.setItem(TECH_DRAFT_KEY, JSON.stringify(draft));
	}
};

export const loadTechDraft = (): TechOnboardingDraft | null => {
	if (typeof window === 'undefined') return null;
	const raw = sessionStorage.getItem(TECH_DRAFT_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as TechOnboardingDraft;
	} catch {
		return null;
	}
};

export const fixoraTechnicianSignup = async (draft: TechOnboardingDraft): Promise<void> => {
	const nickname = draft.fullName.trim().replace(/\s+/g, '').slice(0, 12) || 'tech';
	const apolloClient = await initializeApollo();
	try {
		const result = await apolloClient.mutate({
			mutation: FIXORA_SIGNUP,
			variables: {
				input: {
					userEmail: draft.email.trim(),
					userNickname: nickname,
					userPassword: 'Fixora1!',
					userPhoneNumber: draft.phone.trim() || '01000000000',
					userType: 'TECHNICIAN',
					termsAcceptedAt: new Date().toISOString(),
				},
			},
			fetchPolicy: 'network-only',
		});
		const user = result.data?.signup;
		if (!user?.accessToken) {
			throw new Error('Technician signup failed');
		}
		setAuthTokens(user.accessToken, user.refreshToken ?? '', {
			userProfileImage: user.userProfileImage,
			userNickname: user.userNickname,
			userFullName: user.userFullName,
			userType: user.userType,
		});
		setNeedsOnboarding(false);
	} catch (err) {
		throw new Error(getGraphQLErrorMessage(err));
	}
	saveTechDraft(draft);
};
