import React from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import TechnicianSettingsForm from '../../../libs/components/technician/TechnicianSettingsForm';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const Settings: NextPage = () => {
	return (
		<div className="fixora-technician-settings-page">
			<TechnicianSettingsForm
				onSave={(data) => {
					console.log('Settings saved:', data);
				}}
			/>
		</div>
	);
};

export default withTechnicianLayout(Settings);
