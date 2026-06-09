import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutAuth from '../../../libs/components/layout/LayoutAuth';
import { AuthShell, TechPendingReview } from '../../../libs/components/auth';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'auth'])),
	},
});

const TechPendingPage: NextPage = () => {
	return (
		<AuthShell showBrand={false}>
			<TechPendingReview />
		</AuthShell>
	);
};

export default withLayoutAuth(TechPendingPage, 'meta.pendingTitle');
