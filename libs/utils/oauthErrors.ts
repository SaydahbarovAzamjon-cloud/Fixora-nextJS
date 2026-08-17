import { Messages } from '../config';
import { classifyUserFacingError, getHttpStatusFromError } from './userFacingErrors';

export interface GraphQLErrorDetails {
	message: string;
	code?: string;
}

export function getGraphQLErrorDetails(err: unknown): GraphQLErrorDetails {
	const anyErr = err as {
		graphQLErrors?: { message?: string; extensions?: { code?: string } }[];
		networkError?: { message?: string };
		message?: string;
		response?: { status?: number; data?: { errors?: { message?: string }[]; message?: string } };
	};
	const gqlError = anyErr?.graphQLErrors?.[0];
	const networkMessage = anyErr?.networkError?.message;
	const axiosMessage =
		anyErr?.response?.data?.errors?.[0]?.message || anyErr?.response?.data?.message;
	const status = getHttpStatusFromError(err);
	const statusHint = status ? `Request failed with status code ${status}` : undefined;
	return {
		message:
			gqlError?.message ??
			networkMessage ??
			axiosMessage ??
			anyErr?.message ??
			statusHint ??
			'Request failed',
		code: typeof gqlError?.extensions?.code === 'string' ? gqlError.extensions.code : undefined,
	};
}

export function getGraphQLErrorMessage(err: unknown): string {
	return getGraphQLErrorDetails(err).message;
}

/** True for browser/CORS/offline network failures (not business GraphQL errors). */
export function isNetworkFetchError(err: unknown): boolean {
	const message = getGraphQLErrorMessage(err).toLowerCase();
	const anyErr = err as { networkError?: unknown; name?: string };
	if (anyErr?.networkError) return true;
	return (
		message.includes('failed to fetch') ||
		message.includes('networkerror') ||
		message.includes('network request failed') ||
		message.includes('load failed') ||
		message === 'network error' ||
		message.includes('fetch failed')
	);
}

function prefersKoreanUi(): boolean {
	if (typeof document === 'undefined') return false;
	const lang = (document.documentElement.lang || '').toLowerCase();
	if (lang.startsWith('ko') || lang === 'kr') return true;
	try {
		const cookie = document.cookie || '';
		if (/next-i18next=kr\b/i.test(cookie) || /i18next=kr\b/i.test(cookie)) return true;
	} catch {
		/* ignore */
	}
	return false;
}

/**
 * Map technical Apollo/browser errors to client-safe copy.
 * Prefer component-level `t()` when available; this is the global fallback.
 */
export function toUserFacingErrorMessage(err: unknown, fallback?: string): string {
	const kind = classifyUserFacingError(err);
	if (kind === 'payload_too_large') {
		return prefersKoreanUi()
			? '사진 용량이 너무 큽니다. 5MB 이하 이미지로 다시 시도해주세요.'
			: 'This photo is too large. Please use an image under 5 MB and try again.';
	}
	if (kind === 'network' || isNetworkFetchError(err)) {
		return prefersKoreanUi() ? Messages.errorNetworkKo : Messages.errorNetwork;
	}
	if (kind === 'timeout') {
		return prefersKoreanUi()
			? '요청 시간이 초과되었습니다. 다시 시도해주세요.'
			: 'The request took too long. Please try again.';
	}
	if (kind === 'unauthorized') {
		return prefersKoreanUi()
			? '다시 로그인한 후 시도해주세요.'
			: 'Please log in again and try again.';
	}
	if (kind === 'technical') {
		return fallback || Messages.error1;
	}

	const raw = getGraphQLErrorMessage(err)
		.replace(/^ApolloError:\s*/i, '')
		.replace(/^Error:\s*/i, '')
		.trim();
	if (!raw || /^failed to fetch$/i.test(raw) || /status code\s+\d+/i.test(raw)) {
		return prefersKoreanUi() ? Messages.errorNetworkKo : Messages.errorNetwork;
	}
	return raw || fallback || Messages.error1;
}

export function isOAuthProviderMismatchError(err: unknown): boolean {
	const { message, code } = getGraphQLErrorDetails(err);
	const blob = `${code ?? ''} ${message}`.toLowerCase();
	return (
		code === 'OAUTH_PROVIDER_MISMATCH' ||
		/different sign-in provider|linked to a different|another login method|oauth_login_required|registered with another/i.test(
			blob,
		)
	);
}
