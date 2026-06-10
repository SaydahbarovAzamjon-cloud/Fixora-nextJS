import { NextPage } from 'next';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import TopTechnicians from '../libs/components/homepage/TopTechnicians';
import HowItWorks from '../libs/components/homepage/HowItWorks';
import TechTips from '../libs/components/homepage/TechTips';
import Testimonials from '../libs/components/homepage/Testimonials';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	return (
		<Stack className={'home-page'}>
			<TopTechnicians />
			<HowItWorks />
			<TechTips />
			<Testimonials />
		</Stack>
	);
};

export default withLayoutMain(Home);
