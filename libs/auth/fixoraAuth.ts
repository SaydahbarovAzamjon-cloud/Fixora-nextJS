import { initializeApollo } from '../../apollo/client';
import {
	COMPLETE_OAUTH_SIGNUP,
	FIXORA_LOGIN,
	FIXORA_SIGNUP,
	LOGIN_WITH_OAUTH,
	SUBMIT_TECHNICIAN_VERIFICATION,
} from '../../apollo/user/auth';
import { UPDATE_USER } from '../../apollo/user/profile';
import { userVar } from '../../apollo/store';
import { updateUserInfo } from './index';
import { clearTechOnboardingFiles, getTechIdFile, getTechPhotoFile } from './techOnboardingFiles';
import { uploadImageFile } from '../utils/uploadImageFile';
import { syncUserVarFromGraphqlUser } from './syncUserVar';
import { writeStoredUserEmail, writeTechnicianSettingsCache } from './technicianSettingsCache';
import { dataUrlToFile } from '../utils/onboardingFileStorage';
import { getGraphQLErrorMessage } from '../utils/oauthErrors';
import {
	assertSignupFieldsAvailable,
	deriveSignupNickname,
	isSignupConflictError,
	isValidKrContactPhone,
	throwSignupConflictFromMutation,
} from './signupAvailability';

export { deriveSignupNickname, isSignupConflictError, SignupConflictError } from './signupAvailability';
export type { SignupConflictField } from './signupAvailability';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
	password: string,
	confirmPassword: string,
): AuthValidationResult => {
	const errors: Record<string, string> = {};
	if (!fullName.trim()) errors.fullName = 'nameRequired';
	if (!email.trim()) errors.email = 'emailRequired';
	else if (!validateEmail(email)) errors.email = 'emailInvalid';
	if (phone.trim() && !isValidKrContactPhone(phone)) errors.phone = 'phoneInvalid';
	if (!password) errors.password = 'passwordRequired';
	else if (password.length < 5) errors.password = 'passwordMin';
	else if (password.length > 12) errors.password = 'passwordMax';
	if (password !== confirmPassword) errors.confirmPassword = 'passwordMismatch';
	return { valid: Object.keys(errors).length === 0, errors };
};

export const validateOAuthCompleteInput = (
	nickname: string,
	phone: string,
	termsAccepted: boolean,
): AuthValidationResult => {
	const errors: Record<string, string> = {};
	if (!nickname.trim() || nickname.trim().length < 3) errors.nickname = 'nameRequired';
	if (!phone.trim() || !isValidKrContactPhone(phone)) errors.phone = 'phoneInvalid';
	if (!termsAccepted) errors.terms = 'termsRequired';
	return { valid: Object.keys(errors).length === 0, errors };
};

export interface FixoraAuthProfile {
	_id?: string | null;
	userEmail?: string | null;
	userProfileImage?: string | null;
	userNickname?: string | null;
	userFullName?: string | null;
	userType?: string | null;
	verificationStatus?: string | null;
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
			...(profile._id ? { _id: profile._id } : {}),
			...(profile.userProfileImage ? { memberImage: profile.userProfileImage } : {}),
			...(profile.userNickname ? { memberNick: profile.userNickname } : {}),
			...(profile.userFullName ? { memberFullName: profile.userFullName } : {}),
			...(profile.userType ? { memberType: profile.userType, userType: profile.userType } : {}),
			...(profile.verificationStatus
				? { verificationStatus: profile.verificationStatus }
				: profile.userType === 'TECHNICIAN'
					? { verificationStatus: 'PENDING' }
					: {}),
		});
		if (profile._id && profile.userProfileImage) {
			syncUserVarFromGraphqlUser({
				_id: profile._id,
				userProfileImage: profile.userProfileImage,
			});
		}
		if (profile._id && profile.userEmail) {
			writeStoredUserEmail(profile._id, profile.userEmail);
		}
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
			_id: user._id,
			userEmail: user.userEmail,
			userProfileImage: user.userProfileImage,
			userNickname: user.userNickname,
			userFullName: user.userFullName,
			userType: user.userType,
			verificationStatus: user.verificationStatus,
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
	const nickname = deriveSignupNickname(fullName, userEmail);
	const apolloClient = await initializeApollo();
	try {
		await assertSignupFieldsAvailable(apolloClient, {
			email: userEmail,
			nickname,
			fullName,
			...(userPhone.trim() ? { phone: userPhone } : {}),
		});

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
			_id: user._id,
			userEmail: user.userEmail,
			userProfileImage: user.userProfileImage,
			userNickname: user.userNickname,
			userFullName: user.userFullName,
			userType: user.userType,
			verificationStatus: user.verificationStatus,
		});
		setNeedsOnboarding(false);
	} catch (err) {
		if (isSignupConflictError(err)) throw err;
		throwSignupConflictFromMutation(err);
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
			_id: payload.user?._id,
			userEmail: payload.user?.userEmail,
			userProfileImage: payload.user?.userProfileImage,
			userNickname: payload.user?.userNickname,
			userFullName: payload.user?.userFullName,
			userType: payload.user?.userType,
			verificationStatus: payload.user?.verificationStatus,
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
	try {
		await assertSignupFieldsAvailable(apolloClient, {
			...(input.userEmail?.trim() ? { email: input.userEmail } : {}),
			nickname: input.userNickname,
			phone: input.userPhoneNumber,
			excludeUserId: userVar()._id || undefined,
		});

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
			_id: user._id,
			userNickname: user.userNickname,
			userFullName: user.userFullName,
			userType: user.userType,
			verificationStatus: user.verificationStatus,
		});
		setNeedsOnboarding(false);
		return user.userType;
	} catch (err) {
		if (isSignupConflictError(err)) throw err;
		throwSignupConflictFromMutation(err);
	}
};

/** Technician signup draft — stores multi-step data */
export const TECH_DRAFT_KEY = 'fixora_tech_onboarding_draft';

export interface TechOnboardingDraft {
	fullName: string;
	email: string;
	phone: string;
	password?: string;
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
	const nickname = deriveSignupNickname(draft.fullName, draft.email);
	const apolloClient = await initializeApollo();
	let photoFile = getTechPhotoFile();
	let idFile = getTechIdFile();

	if (!photoFile && draft.photoDataUrl) {
		try {
			photoFile = dataUrlToFile(draft.photoDataUrl, draft.photoFileName ?? 'profile.jpg');
		} catch {
			photoFile = null;
		}
	}
	if (!idFile && draft.idPreviewDataUrl) {
		try {
			const mime = draft.idFileName?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
			idFile = dataUrlToFile(draft.idPreviewDataUrl, draft.idFileName ?? 'id-document', mime);
		} catch {
			idFile = null;
		}
	}

	if (!idFile) {
		throw new Error('ID document is required. Please upload your ID again.');
	}
	if (!draft.password?.trim()) {
		throw new Error('Password is required. Please go back and set your password.');
	}

	try {
		await assertSignupFieldsAvailable(apolloClient, {
			email: draft.email,
			nickname,
			fullName: draft.fullName,
			...(draft.phone.trim() ? { phone: draft.phone } : {}),
		});

		const result = await apolloClient.mutate({
			mutation: FIXORA_SIGNUP,
			variables: {
				input: {
					userEmail: draft.email.trim(),
					userNickname: nickname,
					userPassword: draft.password?.trim() || '',
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

		const token = user.accessToken as string;
		const userId = user._id as string;

		// Persist JWT before guarded mutations (updateUser, submitTechnicianVerification).
		setAuthTokens(token, user.refreshToken ?? '', {
			_id: userId,
			userEmail: draft.email.trim(),
			userNickname: user.userNickname,
			userFullName: draft.fullName.trim(),
			userType: user.userType,
			verificationStatus: user.verificationStatus,
		});

		let profileImagePath: string | undefined;
		const verificationDocuments: string[] = [];

		if (photoFile) {
			profileImagePath = await uploadImageFile(photoFile, token);
		}
		if (idFile) {
			verificationDocuments.push(await uploadImageFile(idFile, token));
		}

		const updateResult = await apolloClient.mutate({
			mutation: UPDATE_USER,
			variables: {
				input: {
					_id: userId,
					userFullName: draft.fullName.trim(),
					...(profileImagePath ? { userProfileImage: profileImagePath } : {}),
					...(verificationDocuments.length ? { verificationDocuments } : {}),
				},
			},
		});
		const updated = updateResult.data?.updateUser;
		if (updated?.userProfileImage) {
			user.userProfileImage = updated.userProfileImage;
		}

		if (verificationDocuments.length > 0) {
			try {
				await apolloClient.mutate({
					mutation: SUBMIT_TECHNICIAN_VERIFICATION,
					fetchPolicy: 'network-only',
				});
			} catch {
				// PENDING without submit is still reviewable by admin (GAP-110)
			}
		}

		setAuthTokens(token, user.refreshToken ?? '', {
			_id: userId,
			userEmail: draft.email.trim(),
			userProfileImage: profileImagePath ?? user.userProfileImage,
			userNickname: user.userNickname,
			userFullName: user.userFullName ?? draft.fullName.trim(),
			userType: user.userType,
			verificationStatus: user.verificationStatus,
		});
		syncUserVarFromGraphqlUser({
			_id: userId,
			userFullName: draft.fullName.trim(),
			userNickname: user.userNickname,
			userProfileImage: profileImagePath ?? user.userProfileImage ?? null,
			userPhoneNumber: draft.phone.trim(),
		});
		writeTechnicianSettingsCache({
			_id: userId,
			userEmail: draft.email.trim(),
			userFullName: draft.fullName.trim(),
			userNickname: user.userNickname,
			userPhoneNumber: draft.phone.trim(),
			userProfileImage: profileImagePath ?? user.userProfileImage ?? null,
			userType: user.userType,
		});
		setNeedsOnboarding(false);

		if (typeof window !== 'undefined') {
			sessionStorage.removeItem(TECH_DRAFT_KEY);
		}
		clearTechOnboardingFiles();
	} catch (err) {
		if (isSignupConflictError(err)) throw err;
		throwSignupConflictFromMutation(err);
	}
};
