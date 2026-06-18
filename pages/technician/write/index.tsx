import React from 'react';
import { NextPage } from 'next';
import { technicianPageProps } from '../../../libs/i18n/technicianPageProps';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import WriteArticlePage from '../../../libs/components/technician/writeArticle/WriteArticlePage';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: await technicianPageProps(locale),
});

const TechnicianWritePage: NextPage = () => <WriteArticlePage />;

export default withTechnicianLayout(TechnicianWritePage);
