import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import TechnicianPublicProfileView from '../../libs/components/technician-profile/TechnicianPublicProfileView';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { resolveAuthUser } from '../../libs/utils/authSession';
import { isTechnicianUser } from '../../libs/utils/userRole';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const TechnicianProfilePage: NextPage = () => {
	const router = useRouter();
	const technicianId = router.query.id as string | undefined;

	useEffect(() => {
		if (!router.isReady || !technicianId) return;
		const authUser = resolveAuthUser();
		if (authUser?._id && isTechnicianUser(authUser) && authUser._id === technicianId) {
			router.replace('/technician/profile').then();
		}
	}, [router.isReady, technicianId, router]);

	if (!router.isReady) return null;

	const authUser = resolveAuthUser();
	if (authUser?._id && isTechnicianUser(authUser) && authUser._id === technicianId) {
		return null;
	}

	return (
		<Stack className="fixora-tech-profile-page">
			<Stack className="container">
				<TechnicianPublicProfileView technicianId={technicianId} variant="visitor" />
			</Stack>
		</Stack>
	);
};

export default withLayoutFull(TechnicianProfilePage);
