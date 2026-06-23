import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { FileQuestion } from 'lucide-react';

const AdminNotFound: React.FC = () => {
	const { t } = useTranslation('admin');
	const router = useRouter();

	return (
		<div className="fixora-admin-not-found">
			<FileQuestion size={48} className="fixora-admin-not-found__icon" />
			<h1 className="fixora-admin-not-found__code">404</h1>
			<h2 className="fixora-admin-not-found__title">{t('errors.notFoundTitle')}</h2>
			<p className="fixora-admin-not-found__text">{t('errors.notFoundText')}</p>
			<button type="button" className="fixora-admin-btn fixora-admin-btn--primary" onClick={() => router.push('/_admin')}>
				{t('errors.backToDashboard')}
			</button>
		</div>
	);
};

export default AdminNotFound;
