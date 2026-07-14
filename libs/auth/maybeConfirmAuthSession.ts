import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { CONFIRM_AUTH_SESSION } from '../../apollo/user/auth';
import { getJwtToken } from '../auth';
import {
	clearAuthConfirmPending,
	isAuthConfirmPending,
	isAuthSettledLandingPath,
} from './authConfirmFlow';
import { isAuthTelegramPending } from './authTelegramFlow';
import { needsPostSignupOnboarding } from './postSignupOnboarding';

/**
 * Fire admin signup/login monitors only after the auth UI is done and the user
 * has rendered home / technician dashboard (not Telegram step / onboarding).
 */
export async function maybeConfirmAuthSession(params: {
	client: ApolloClient<NormalizedCacheObject> | ApolloClient<object>;
	pathname: string;
	userId?: string | null;
}): Promise<void> {
	const { client, pathname, userId } = params;
	if (!userId || !getJwtToken()) return;
	if (!isAuthConfirmPending()) return;
	if (isAuthTelegramPending()) return;
	if (needsPostSignupOnboarding(userId)) return;
	if (!isAuthSettledLandingPath(pathname)) return;

	try {
		await client.mutate({
			mutation: CONFIRM_AUTH_SESSION,
			context: { suppressErrorAlert: true },
		});
	} catch {
		/* non-blocking — admin alert is best-effort (backend may lag deploy) */
		return;
	}
	clearAuthConfirmPending();
}
