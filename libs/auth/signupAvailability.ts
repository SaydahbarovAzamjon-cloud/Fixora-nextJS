import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { CHECK_SIGNUP_AVAILABILITY } from '../../apollo/user/auth';
import { getGraphQLErrorDetails, getGraphQLErrorMessage } from '../utils/oauthErrors';

export type SignupConflictField = 'email' | 'phone' | 'nickname' | 'fullName';

type ApiSignupConflictField = 'EMAIL' | 'PHONE' | 'NICKNAME' | 'FULL_NAME';

const API_FIELD_MAP: Record<ApiSignupConflictField, SignupConflictField> = {
	EMAIL: 'email',
	PHONE: 'phone',
	NICKNAME: 'nickname',
	FULL_NAME: 'fullName',
};

const I18N_BY_FIELD: Record<SignupConflictField, string> = {
	email: 'emailTaken',
	phone: 'phoneTaken',
	nickname: 'nicknameTaken',
	fullName: 'nameTaken',
};

export class SignupConflictError extends Error {
	readonly conflicts: Partial<Record<SignupConflictField, string>>;

	constructor(conflicts: Partial<Record<SignupConflictField, string>>) {
		super('Signup field conflicts');
		this.name = 'SignupConflictError';
		this.conflicts = conflicts;
	}

	static fromFields(fields: SignupConflictField[]): SignupConflictError {
		const conflicts: Partial<Record<SignupConflictField, string>> = {};
		for (const field of fields) {
			conflicts[field] = I18N_BY_FIELD[field];
		}
		return new SignupConflictError(conflicts);
	}
}

export function isSignupConflictError(err: unknown): err is SignupConflictError {
	return err instanceof SignupConflictError;
}

export function deriveSignupNickname(fullName: string, emailFallback: string): string {
	const compact = fullName.trim().replace(/\s+/g, '');
	if (compact.length >= 3) return compact.slice(0, 12);
	const local = emailFallback.split('@')[0]?.trim() ?? '';
	return local.slice(0, 12) || 'user';
}

export function normalizeSignupEmail(email: string): string {
	return email.trim().toLowerCase();
}

export function normalizeSignupPhone(phone: string): string {
	const digits = phone.replace(/\D/g, '');
	if (digits.startsWith('82') && digits.length >= 10) {
		return `0${digits.slice(2)}`;
	}
	return digits;
}

export function normalizeSignupFullName(fullName: string): string {
	return fullName.trim().replace(/\s+/g, ' ').toLowerCase();
}

export interface SignupAvailabilityInput {
	email?: string;
	phone?: string;
	nickname?: string;
	fullName?: string;
	excludeUserId?: string;
}

function mapApiConflictField(field: string): SignupConflictField | null {
	return API_FIELD_MAP[field as ApiSignupConflictField] ?? null;
}

function conflictsFromApi(
	conflicts: { field: string; message?: string | null }[] | null | undefined,
): Partial<Record<SignupConflictField, string>> {
	const mapped: Partial<Record<SignupConflictField, string>> = {};
	for (const conflict of conflicts ?? []) {
		const field = mapApiConflictField(conflict.field);
		if (field) mapped[field] = I18N_BY_FIELD[field];
	}
	return mapped;
}

export async function fetchSignupAvailability(
	apolloClient: ApolloClient<NormalizedCacheObject>,
	input: SignupAvailabilityInput,
) {
	const result = await apolloClient.query({
		query: CHECK_SIGNUP_AVAILABILITY,
		variables: {
			input: {
				...(input.email?.trim() ? { userEmail: normalizeSignupEmail(input.email) } : {}),
				...(input.nickname?.trim() ? { userNickname: input.nickname.trim() } : {}),
				...(input.phone?.trim() ? { userPhoneNumber: input.phone.trim() } : {}),
				...(input.fullName?.trim() ? { userFullName: input.fullName.trim() } : {}),
				...(input.excludeUserId?.trim() ? { excludeUserId: input.excludeUserId.trim() } : {}),
			},
		},
		fetchPolicy: 'network-only',
	});

	return result.data?.checkSignupAvailability as
		| {
				available: boolean;
				conflicts: { field: string; message: string }[];
		  }
		| undefined;
}

export function parseSignupMutationConflicts(err: unknown): Partial<Record<SignupConflictField, string>> | null {
	const anyErr = err as {
		graphQLErrors?: {
			message?: string;
			extensions?: { code?: string; field?: string };
			code?: string;
		}[];
	};
	const gqlError = anyErr?.graphQLErrors?.[0];
	const code = gqlError?.extensions?.code ?? gqlError?.code ?? getGraphQLErrorDetails(err).code;
	const extensionField = gqlError?.extensions?.field;

	if (code === 'SIGNUP_CONFLICT' && typeof extensionField === 'string') {
		const field = mapApiConflictField(extensionField);
		if (field) return { [field]: I18N_BY_FIELD[field] };
	}

	const message = getGraphQLErrorMessage(err).toLowerCase();
	if (!message) return null;

	const conflicts: Partial<Record<SignupConflictField, string>> = {};
	if (/email|useremail|gmail|@/.test(message) && /(already|exist|duplicate|taken|registered)/.test(message)) {
		conflicts.email = 'emailTaken';
	}
	if (/nickname|usernickname|nick/.test(message) && /(already|exist|duplicate|taken)/.test(message)) {
		conflicts.nickname = 'nicknameTaken';
	}
	if (/phone|userphonenumber|mobile/.test(message) && /(already|exist|duplicate|taken)/.test(message)) {
		conflicts.phone = 'phoneTaken';
	}
	if (/(full\s*name|userfullname|name)/.test(message) && /(already|exist|duplicate|taken)/.test(message)) {
		conflicts.fullName = 'nameTaken';
	}

	return Object.keys(conflicts).length > 0 ? conflicts : null;
}

export async function assertSignupFieldsAvailable(
	apolloClient: ApolloClient<NormalizedCacheObject>,
	input: SignupAvailabilityInput,
): Promise<void> {
	const hasInput =
		!!input.email?.trim() ||
		!!input.nickname?.trim() ||
		!!input.phone?.trim() ||
		!!input.fullName?.trim();

	if (!hasInput) return;

	const availability = await fetchSignupAvailability(apolloClient, input);
	if (!availability || availability.available) return;

	const conflicts = conflictsFromApi(availability.conflicts);
	if (Object.keys(conflicts).length > 0) {
		throw new SignupConflictError(conflicts);
	}
}

export function throwSignupConflictFromMutation(err: unknown): never {
	const parsed = parseSignupMutationConflicts(err);
	if (parsed) throw new SignupConflictError(parsed);
	throw err instanceof Error ? err : new Error(getGraphQLErrorMessage(err));
}
