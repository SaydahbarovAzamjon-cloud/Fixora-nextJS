import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { getJwtToken, updateUserInfo } from '../../libs/auth';

const isTechnicianUser = (user: ReturnType<typeof userVar>) =>
	user?.memberType === 'TECHNICIAN' || user?.userType === 'TECHNICIAN';

/** `/technician` — redirect only; dashboard lives at `/technician/dashboard`. */
const TechnicianIndex: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [bootstrapped, setBootstrapped] = useState(false);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
		setBootstrapped(true);
	}, []);

	useEffect(() => {
		if (!bootstrapped) return;

		const jwt = getJwtToken();
		if (!jwt) {
			router.replace('/login?referrer=/technician/dashboard').then();
			return;
		}

		const current = userVar();
		if (isTechnicianUser(current)) {
			router.replace('/technician/dashboard').then();
			return;
		}

		if (current._id) {
			router.replace('/').then();
		}
	}, [bootstrapped, user, router]);

	return null;
};

export default TechnicianIndex;
