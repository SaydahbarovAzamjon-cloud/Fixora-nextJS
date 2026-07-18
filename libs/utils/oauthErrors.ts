import { Messages } from '../config';

export interface GraphQLErrorDetails {
	message: string;
	code?: string;
}

export function getGraphQLErrorDetails(err: unknown): GraphQLErrorDetails {
	const anyErr = err as {
		graphQLErrors?: { message?: string; extensions?: { code?: string } }[];
		networkError?: { message?: string };
		message?: string;
	};
	const gqlError = anyErr?.graphQLErrors?.[0];
	const networkMessage = anyErr?.networkError?.message;
	return {
		message: gqlError?.message ?? networkMessage ?? anyErr?.message ?? 'Request failed',
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
	if (isNetworkFetchError(err)) {
		return prefersKoreanUi() ? Messages.errorNetworkKo : Messages.errorNetwork;
	}
	const raw = getGraphQLErrorMessage(err)
		.replace(/^ApolloError:\s*/i, '')
		.replace(/^Error:\s*/i, '')
		.trim();
	if (!raw || /^failed to fetch$/i.test(raw)) {
		return prefersKoreanUi() ? Messages.errorNetworkKo : Messages.errorNetwork;
	}
	// Hide minified / runtime JS noise from end users.
	if (/is not a function|Cannot read propert|TypeError|ReferenceError|undefined is not/i.test(raw)) {
		return fallback || Messages.error1;
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
