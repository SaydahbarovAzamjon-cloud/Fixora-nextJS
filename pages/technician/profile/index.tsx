import React from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import TechnicianProfileForm from '../../../libs/components/technician/TechnicianProfileForm';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const PublicProfile: NextPage = () => {
	return (
		<div className="fixora-technician-profile-page">
			<TechnicianProfileForm
				onSave={(data) => {
					console.log('Profile updated:', data);
				}}
			/>
		</div>
	);
};

export default withTechnicianLayout(PublicProfile);
