import React from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const Analytics: NextPage = () => {
	return (
		<div className="fixora-technician-analytics">
			<h1>Analytics</h1>
			<p>Screen 7: Analytics - coming soon</p>
		</div>
	);
};

export default withTechnicianLayout(Analytics);
