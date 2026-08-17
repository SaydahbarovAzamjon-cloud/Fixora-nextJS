/**
 * Classify client/API failures so UI can show clear i18n copy
 * instead of raw Axios / minified JS text (e.g. "status code 413").
 */

export type UserFacingErrorKind =
	| 'payload_too_large'
	| 'network'
	| 'timeout'
	| 'unauthorized'
	| 'forbidden'
	| 'not_found'
	| 'technical'
	| 'business';

function readRawMessage(err: unknown): string {
	const anyErr = err as {
		graphQLErrors?: { message?: string }[];
		networkError?: { message?: string; result?: { errors?: { message?: string }[] } };
		message?: string;
		response?: { data?: { message?: string; errors?: { message?: string }[] } };
		errors?: { message?: string }[];
		cause?: unknown;
	};

	return (
		anyErr?.graphQLErrors?.[0]?.message ||
		anyErr?.networkError?.result?.errors?.[0]?.message ||
		anyErr?.networkError?.message ||
		anyErr?.response?.data?.errors?.[0]?.message ||
		anyErr?.response?.data?.message ||
		anyErr?.errors?.[0]?.message ||
		anyErr?.message ||
		(anyErr?.cause ? readRawMessage(anyErr.cause) : '') ||
		''
	);
}

function readAxiosLike(err: unknown): {
	status?: number;
	dataMessage?: string;
} {
	const anyErr = err as {
		status?: number;
		response?: {
			status?: number;
			data?: { message?: string; errors?: { message?: string }[] };
		};
		networkError?: { statusCode?: number; status?: number };
		cause?: unknown;
	};

	const nested = anyErr?.cause ? readAxiosLike(anyErr.cause) : {};
	const status =
		(typeof anyErr?.response?.status === 'number' ? anyErr.response.status : undefined) ??
		(typeof anyErr?.status === 'number' ? anyErr.status : undefined) ??
		(typeof anyErr?.networkError?.statusCode === 'number' ? anyErr.networkError.statusCode : undefined) ??
		(typeof anyErr?.networkError?.status === 'number' ? anyErr.networkError.status : undefined) ??
		nested.status;

	const dataMessage =
		anyErr?.response?.data?.errors?.[0]?.message ||
		anyErr?.response?.data?.message ||
		nested.dataMessage;

	return { status, dataMessage };
}

/** HTTP status from Axios / Apollo network errors, or parsed from "status code NNN". */
export function getHttpStatusFromError(err: unknown): number | undefined {
	const { status } = readAxiosLike(err);
	if (typeof status === 'number' && status > 0) return status;

	const message = readRawMessage(err);
	const match =
		message.match(/status code\s+(\d{3})/i) ||
		message.match(/\b(413|401|403|404|408|429|500|502|503|504)\b/);
	if (match?.[1]) return Number(match[1]);
	return undefined;
}

function looksLikeTechnicalNoise(message: string): boolean {
	return (
		!message ||
		/^request failed$/i.test(message) ||
		/^network error$/i.test(message) ||
		/^failed to fetch$/i.test(message) ||
		/status code\s+\d+/i.test(message) ||
		/is not a function|Cannot read propert|TypeError|ReferenceError|undefined is not|maximum call stack/i.test(
			message,
		) ||
		/ECONNRESET|ETIMEDOUT|ENOTFOUND|ECONNREFUSED|socket hang up/i.test(message)
	);
}

function isLikelyNetworkFailure(err: unknown, message: string): boolean {
	const anyErr = err as { networkError?: unknown };
	if (anyErr?.networkError) return true;
	const lower = message.toLowerCase();
	return (
		lower.includes('failed to fetch') ||
		lower.includes('networkerror') ||
		lower.includes('network request failed') ||
		lower.includes('load failed') ||
		lower === 'network error' ||
		lower.includes('fetch failed')
	);
}

/**
 * Classify client/API failures so UI can show i18n copy instead of raw Axios/JS text.
 */
export function classifyUserFacingError(err: unknown): UserFacingErrorKind {
	const status = getHttpStatusFromError(err);
	const message = readRawMessage(err);
	const blob = `${message} ${readAxiosLike(err).dataMessage || ''}`.toLowerCase();

	if (
		status === 413 ||
		/payload too large|entity too large|request entity too large|file too large|image too large/.test(
			blob,
		)
	) {
		return 'payload_too_large';
	}
	if (status === 401 || /unauthorized|not authenticated|jwt expired|invalid token/i.test(blob)) {
		return 'unauthorized';
	}
	if (status === 403 || /forbidden|access denied/i.test(blob)) {
		return 'forbidden';
	}
	if (status === 404) return 'not_found';
	if (status === 408 || status === 504 || /timeout|timed out|aborted/i.test(blob)) {
		return 'timeout';
	}
	if (status === 429 || /too many requests|rate limit/i.test(blob)) {
		return 'timeout';
	}
	if (isLikelyNetworkFailure(err, message) || status === 502 || status === 503) {
		return 'network';
	}
	if (status && status >= 500) return 'technical';
	if (looksLikeTechnicalNoise(message)) return 'technical';

	return 'business';
}

/**
 * Map an error to a user-readable string using an i18n lookup + optional business message passthrough.
 */
export function resolveUserFacingErrorMessage(
	err: unknown,
	t: (key: string) => string,
	keys: {
		payloadTooLarge: string;
		network: string;
		timeout: string;
		unauthorized: string;
		forbidden?: string;
		notFound?: string;
		technical?: string;
		fallback: string;
	},
): string {
	const kind = classifyUserFacingError(err);
	switch (kind) {
		case 'payload_too_large':
			return t(keys.payloadTooLarge);
		case 'network':
			return t(keys.network);
		case 'timeout':
			return t(keys.timeout);
		case 'unauthorized':
			return t(keys.unauthorized);
		case 'forbidden':
			return t(keys.forbidden || keys.fallback);
		case 'not_found':
			return t(keys.notFound || keys.fallback);
		case 'technical':
			return t(keys.technical || keys.fallback);
		case 'business': {
			const raw = readRawMessage(err).replace(/^Error:\s*/i, '').trim();
			if (!raw || looksLikeTechnicalNoise(raw)) return t(keys.fallback);
			return raw;
		}
		default:
			return t(keys.fallback);
	}
}
