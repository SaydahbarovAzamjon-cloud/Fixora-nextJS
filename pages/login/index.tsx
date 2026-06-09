import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutAuth from '../../libs/components/layout/LayoutAuth';
import { AuthShell, LoginForm } from '../../libs/components/auth';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'auth'])),
	},
});

const LoginPage: NextPage = () => {
	return (
		<AuthShell>
			<LoginForm />
		</AuthShell>
	);
};

export default withLayoutAuth(LoginPage, 'meta.loginTitle');
