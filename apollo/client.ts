import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, from, NormalizedCacheObject } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { onError } from '@apollo/client/link/error';
import { getJwtToken } from '../libs/auth/tokens';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { sweetErrorAlert } from '../libs/sweetAlert';
import { isNoDataFoundGraphQLError } from '../libs/utils/graphqlErrors';
import { isRoleRestrictedError, isMissingTokenError, shouldRedirectToLogin } from '../libs/utils/userRole';
import { handleSessionExpired } from '../libs/auth/sessionExpiry';
import { getGraphqlUrl } from '../libs/env/publicEnv';
let apolloClient: ApolloClient<NormalizedCacheObject>;
const isProd = process.env.NODE_ENV === 'production';

function getHeaders() {
	const headers: Record<string, string> = {
		// Apollo Server 4 CSRF prevention — required for login and other mutations
		'apollo-require-preflight': 'true',
	};
	const token = getJwtToken();
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

const tokenRefreshLink = new TokenRefreshLink({
	accessTokenField: 'accessToken',
	isTokenValidOrUndefined: () => {
		return true;
	}, // @ts-ignore
	fetchAccessToken: () => {
		// execute refresh token
		return null;
	},
});

function createIsomorphicLink() {
	const authLink = new ApolloLink((operation, forward) => {
		operation.setContext(({ headers = {} }) => ({
			headers: {
				...headers,
				...getHeaders(),
			},
		}));
		if (process.env.NEXT_PUBLIC_APOLLO_DEBUG === 'true' && !isProd) {
			console.debug('[Apollo]', operation.operationName);
		}
		return forward(operation);
	});

	// @ts-ignore
	const httpLink = new createUploadLink({
		uri: getGraphqlUrl(),
	});

	const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
		if (graphQLErrors) {
			graphQLErrors.forEach(({ message, locations, path }) => {
				const isAuthMutation =
					path?.[0] === 'login' ||
					path?.[0] === 'signup' ||
					path?.[0] === 'loginWithOAuth' ||
					path?.[0] === 'completeOAuthSignup';
				const isRoleError = isRoleRestrictedError(message);
				const isAuthError = isMissingTokenError(message);
				const isExpiredSession = shouldRedirectToLogin(message);

				const suppressAlert = operation.getContext().suppressErrorAlert;
				const isLookupMiss = isNoDataFoundGraphQLError(message);

				if (isExpiredSession) {
					handleSessionExpired();
					return;
				}

				if (isRoleError || isAuthError || isLookupMiss) {
					if (!isProd) console.debug(`[GraphQL auth]: ${message}`);
				} else {
					if (!isProd) {
						console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
					}
				}

				if (
					!suppressAlert &&
					!isLookupMiss &&
					!message.includes('input') &&
					!isAuthMutation &&
					!isRoleError &&
					!isAuthError &&
					!isExpiredSession
				) {
					sweetErrorAlert(message);
				}
			});
		}

		if (networkError && !isProd) console.log(`[Network error]: ${networkError}`);
		// @ts-ignore
		const statusCode = networkError?.statusCode ?? networkError?.status;
		if (statusCode === 401) {
			handleSessionExpired();
		}
	});

	// Realtime push uses libs/utils/fixoraWebSocket.ts (FixoraWebSocketBridge) — not Apollo subscriptions.
	return from([errorLink, tokenRefreshLink, authLink.concat(httpLink)]);
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(),
		resolvers: {},
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: any) { /* Apollo ni componentga beradi */
	return useMemo(() => initializeApollo(initialState), [initialState]); /* Apollo ni qayta-qayta create qilmaydi */
}

/**
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// No Subscription required for develop process

const httpLink = createHttpLink({
  uri: "http://localhost:3007/graphql",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
*/
