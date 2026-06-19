import { useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { userVar } from '../../apollo/store';
import { getJwtToken, updateUserInfo } from '../auth';
import { getPostAuthRoute } from '../utils/postAuthRoute';

/** Block customer homepage paint while redirecting logged-in users away from `/`. */
export function useHomeAuthRedirect() {
	const router = useRouter();
	const [redirecting, setRedirecting] = useState(false);

	useLayoutEffect(() => {
		if (router.pathname !== '/') return;

		const jwt = getJwtToken();
		if (!jwt) return;

		updateUserInfo(jwt);
		const current = userVar();
		if (!current?._id) return;

		const dest = getPostAuthRoute(current);
		if (dest === '/') return;

		setRedirecting(true);
		router.replace(dest).then();
	}, [router, router.pathname]);

	return redirecting;
}
