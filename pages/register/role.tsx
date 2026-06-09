import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutAuth from '../../libs/components/layout/LayoutAuth';
import { AuthShell, RoleSelect } from '../../libs/components/auth';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'auth'])),
	},
});

const RolePage: NextPage = () => {
	return (
		<AuthShell>
			<RoleSelect />
		</AuthShell>
	);
};

export default withLayoutAuth(RolePage, 'meta.roleTitle');
