import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { technicianPageProps } from '../../../libs/i18n/technicianPageProps';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: await technicianPageProps(locale),
});

const TechnicianClientProfile: NextPage = () => {
	const router = useRouter();
	const clientId = router.query.id as string | undefined;

	useEffect(() => {
		if (!router.isReady || !clientId) return;
		router.replace(`/technician/client/${clientId}`).then();
	}, [router, router.isReady, clientId]);

	return null;
};

export default withTechnicianLayout(TechnicianClientProfile);
