import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutOnboarding from '../../libs/components/layout/LayoutOnboarding';
import { AuthShell } from '../../libs/components/auth';
import { CustomerOnboardingForm } from '../../libs/components/onboarding';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'auth'])),
	},
});

const CustomerOnboardingPage: NextPage = () => (
	<AuthShell>
		<CustomerOnboardingForm />
	</AuthShell>
);

export default withLayoutOnboarding(CustomerOnboardingPage, 'onboarding.meta.customerTitle');
