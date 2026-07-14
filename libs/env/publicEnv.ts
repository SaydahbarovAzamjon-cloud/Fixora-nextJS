/**
 * Central resolver for Fixora public API URLs (GraphQL, REST assets, WebSocket).
 * NEXT_PUBLIC_* values are baked at build time; runtime guard avoids localhost on prod hosts.
 */

const PROD_ORIGIN = 'https://fixoranext.com';
const DEFAULT_GRAPHQL = 'http://localhost:2000/graphql';
const DEFAULT_WS = 'ws://localhost:2000';

function stripTrailingSlash(url: string): string {
	return url.replace(/\/$/, '');
}

function isLocalhostHost(hostname: string): boolean {
	return hostname === 'localhost' || hostname === '127.0.0.1';
}

function isLocalhostUrl(url: string): boolean {
	if (!url || url === 'undefined') return false;
	try {
		return isLocalhostHost(new URL(url).hostname);
	} catch {
		return /localhost|127\.0\.0\.1/.test(url);
	}
}

function browserOrigin(): string | null {
	if (typeof window === 'undefined') return null;
	return window.location.origin;
}

function productionOrigin(): string {
	const origin = browserOrigin();
	if (!origin || isLocalhostUrl(origin)) return PROD_ORIGIN;
	return stripTrailingSlash(origin);
}

/** When deployed with wrong baked localhost URLs, fall back to same-origin / prod API. */
function resolveUrl(baked: string | undefined, fallback: string, pathSuffix = ''): string {
	const raw = baked && baked !== 'undefined' ? baked.trim() : fallback;
	const origin = browserOrigin();

	if (origin && !isLocalhostUrl(origin) && isLocalhostUrl(raw)) {
		const base = productionOrigin();
		return pathSuffix ? `${base}${pathSuffix}` : base;
	}

	return stripTrailingSlash(raw);
}

export function getGraphqlUrl(): string {
	const baked =
		process.env.REACT_APP_API_GRAPHQL_URL ||
		process.env.NEXT_PUBLIC_GRAPHQL_URL ||
		DEFAULT_GRAPHQL;
	return resolveUrl(baked, DEFAULT_GRAPHQL, '/graphql');
}

export function getApiBaseUrl(): string {
	const baked = process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL;
	const fromGraphql = getGraphqlUrl().replace(/\/graphql\/?$/, '');
	return resolveUrl(baked, fromGraphql);
}

export function getWsUrl(): string {
	const baked =
		process.env.REACT_APP_API_WS || process.env.NEXT_PUBLIC_WS_URL || DEFAULT_WS;
	const origin = browserOrigin();

	if (origin && !isLocalhostUrl(origin) && isLocalhostUrl(baked)) {
		const wsOrigin = productionOrigin().replace(/^http/i, 'ws');
		return `${wsOrigin}/graphql/ws`;
	}

	return resolveUrl(baked, DEFAULT_WS);
}
