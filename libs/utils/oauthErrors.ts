export interface GraphQLErrorDetails {
	message: string;
	code?: string;
}

export function getGraphQLErrorDetails(err: unknown): GraphQLErrorDetails {
	const anyErr = err as {
		graphQLErrors?: { message?: string; extensions?: { code?: string } }[];
		message?: string;
	};
	const gqlError = anyErr?.graphQLErrors?.[0];
	return {
		message: gqlError?.message ?? anyErr?.message ?? 'Request failed',
		code: typeof gqlError?.extensions?.code === 'string' ? gqlError.extensions.code : undefined,
	};
}

export function getGraphQLErrorMessage(err: unknown): string {
	return getGraphQLErrorDetails(err).message;
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
