import React from 'react';
import { NextPage } from 'next';
import { technicianPageProps } from '../../../libs/i18n/technicianPageProps';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import HelpSupportPage from '../../../libs/components/technician/help/HelpSupportPage';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: await technicianPageProps(locale),
});

const TechnicianHelpPage: NextPage = () => <HelpSupportPage />;

export default withTechnicianLayout(TechnicianHelpPage);
