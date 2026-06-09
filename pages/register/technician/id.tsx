import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutAuth from '../../../libs/components/layout/LayoutAuth';
import { AuthShell, TechIdUpload } from '../../../libs/components/auth';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'auth'])),
	},
});

const TechIdPage: NextPage = () => {
	return (
		<AuthShell>
			<TechIdUpload />
		</AuthShell>
	);
};

export default withLayoutAuth(TechIdPage, 'meta.techTitle');
