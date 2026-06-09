import { useEffect } from 'react';
import { useRouter } from 'next/router';

/** Legacy route — redirects to /login (see next.config.js). */
const JoinRedirect = () => {
	const router = useRouter();

	useEffect(() => {
		router.replace('/login');
	}, [router]);

	return null;
};

export default JoinRedirect;
