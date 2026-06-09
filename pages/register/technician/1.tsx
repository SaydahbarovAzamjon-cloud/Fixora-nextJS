import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutAuth from '../../../libs/components/layout/LayoutAuth';
import { AuthShell, TechOnboardingStep1 } from '../../../libs/components/auth';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'auth'])),
	},
});

const TechStep1Page: NextPage = () => {
	return (
		<AuthShell>
			<TechOnboardingStep1 />
		</AuthShell>
	);
};

export default withLayoutAuth(TechStep1Page, 'meta.techTitle');
