import { NextPage } from 'next';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import TopTechnicians from '../libs/components/homepage/TopTechnicians';
import HowItWorks from '../libs/components/homepage/HowItWorks';
import TechTips from '../libs/components/homepage/TechTips';
import Testimonials from '../libs/components/homepage/Testimonials';
import HomepageStoriesCarousel from '../libs/components/homepage/HomepageStoriesCarousel';

export const getStaticProps = async ({ locale }: any) => {
	const translations = await serverSideTranslations(locale ?? 'en', ['common']);
	return {
		props: {
			...translations,
		},
	};
};

const Home: NextPage = () => {
	return (
		<Stack className={'home-page'}>
			<HomepageStoriesCarousel />
			<TopTechnicians />
			<HowItWorks />
			<TechTips />
			<Testimonials />
		</Stack>
	);
};

export default withLayoutMain(Home);
