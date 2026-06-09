import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutAuth from '../../libs/components/layout/LayoutAuth';
import { AuthShell, RegisterForm } from '../../libs/components/auth';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'auth'])),
	},
});

const RegisterPage: NextPage = () => {
	return (
		<AuthShell>
			<RegisterForm />
		</AuthShell>
	);
};

export default withLayoutAuth(RegisterPage, 'meta.registerTitle');
