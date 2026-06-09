import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutAuth from '../../libs/components/layout/LayoutAuth';
import { AuthShell } from '../../libs/components/auth';
import { FixoraButton } from '../../libs/components/ui';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'auth'])),
	},
});

const ForgotPasswordPage: NextPage = () => {
	const { t } = useTranslation('auth');
	const router = useRouter();

	return (
		<AuthShell>
			<div className="auth-heading">
				<h1>{t('forgot.title')}</h1>
				<p>{t('forgot.subtitle')}</p>
			</div>
			<FixoraButton variant="outline" fullWidth onClick={() => router.push('/login')}>
				{t('forgot.backToLogin')}
			</FixoraButton>
		</AuthShell>
	);
};

export default withLayoutAuth(ForgotPasswordPage, 'meta.loginTitle');
