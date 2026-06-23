import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { ShieldX } from 'lucide-react';
import { FixoraLogo } from '../brand';

const AdminForbidden: React.FC = () => {
	const { t } = useTranslation('admin');
	const router = useRouter();

	return (
		<div className="fixora-admin-forbidden">
			<div className="fixora-admin-forbidden__card">
				<FixoraLogo size="sm" />
				<ShieldX size={48} className="fixora-admin-forbidden__icon" />
				<h1 className="fixora-admin-forbidden__title">{t('errors.forbiddenTitle')}</h1>
				<p className="fixora-admin-forbidden__text">{t('errors.forbiddenText')}</p>
				<button type="button" className="fixora-admin-btn fixora-admin-btn--primary" onClick={() => router.push('/')}>
					{t('errors.backToHome')}
				</button>
			</div>
		</div>
	);
};

export default AdminForbidden;
