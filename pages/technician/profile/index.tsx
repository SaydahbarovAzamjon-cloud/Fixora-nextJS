import React from 'react';
import { NextPage } from 'next';
import { useReactiveVar } from '@apollo/client';
import { technicianPageProps } from '../../../libs/i18n/technicianPageProps';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import TechnicianPublicProfileView from '../../../libs/components/technician-profile/TechnicianPublicProfileView';
import { userVar } from '../../../apollo/store';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: await technicianPageProps(locale),
});

const PublicProfile: NextPage = () => {
	const user = useReactiveVar(userVar);

	return <TechnicianPublicProfileView technicianId={user?._id} variant="owner" />;
};

export default withTechnicianLayout(PublicProfile);
