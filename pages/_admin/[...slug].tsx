import { NextPage } from 'next';
import withAdminLayout from '../../libs/components/layout/AdminLayout';
import { adminPageProps } from '../../libs/i18n/adminPageProps';
import AdminNotFound from '../../libs/components/admin/AdminNotFound';
import AdminHeader from '../../libs/components/admin/AdminHeader';
import { useTranslation } from 'next-i18next';

const AdminCatchAllPage: NextPage = () => {
	const { t } = useTranslation('admin');

	return (
		<>
			<AdminHeader title={t('errors.notFoundTitle')} />
			<div className="fixora-admin-page">
				<AdminNotFound />
			</div>
		</>
	);
};

export const getServerSideProps = adminPageProps;

export default withAdminLayout(AdminCatchAllPage, { title: 'Not Found' });
