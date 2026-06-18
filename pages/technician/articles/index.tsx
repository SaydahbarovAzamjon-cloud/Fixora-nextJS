import React from 'react';
import { NextPage } from 'next';
import { technicianPageProps } from '../../../libs/i18n/technicianPageProps';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import MyArticlesPage from '../../../libs/components/technician/myArticles/MyArticlesPage';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: await technicianPageProps(locale),
});

const TechnicianArticlesPage: NextPage = () => <MyArticlesPage />;

export default withTechnicianLayout(TechnicianArticlesPage);
