import React from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import type { AdminUser } from '../../../../types/admin/admin';
import type { LoginHistoryItem } from '../../../../types/admin/admin';
import { dateLocale } from '../../../../utils/i18nLocale';

interface Props {
	user: AdminUser;
	loginHistory: LoginHistoryItem[];
}

const AdminUserActivity: React.FC<Props> = ({ user, loginHistory }) => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const locale = dateLocale(router.locale);

	const formatDate = (value?: string) =>
		value
			? new Date(value).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })
			: '—';

	return (
		<section id="activity" className="fixora-admin-user-section">
			<h3 className="fixora-admin-user-section__title">{t('userDetail.sections.activity')}</h3>

			<dl className="fixora-admin-user-kv">
				<div className="fixora-admin-user-kv__row">
					<dt>{t('userDetail.activity.lastLogin')}</dt>
					<dd>{formatDate(user.lastLoginAt)}</dd>
				</div>
				<div className="fixora-admin-user-kv__row">
					<dt>{t('userDetail.activity.accountCreated')}</dt>
					<dd>{formatDate(user.createdAt)}</dd>
				</div>
				<div className="fixora-admin-user-kv__row">
					<dt>{t('userDetail.activity.lastUpdated')}</dt>
					<dd>{formatDate(user.updatedAt)}</dd>
				</div>
			</dl>

			<h4 className="fixora-admin-user-section__subtitle">{t('userDetail.activity.loginHistory')}</h4>
			{loginHistory.length === 0 ? (
				<p className="fixora-admin-muted">{t('userDetail.activity.noLoginHistory')}</p>
			) : (
				<ul className="fixora-admin-user-list">
					{loginHistory.map((entry) => (
						<li key={entry._id} className="fixora-admin-user-list__item">
							<strong>{formatDate(entry.createdAt)}</strong>
							<span>
								{entry.authProvider}
								{entry.ipAddress ? ` · ${t('userDetail.activity.ip')}: ${entry.ipAddress}` : ''}
								{' · '}
								{entry.success ? t('userDetail.activity.success') : t('userDetail.activity.failed')}
							</span>
							{entry.userAgent && <span className="fixora-admin-muted">{entry.userAgent}</span>}
						</li>
					))}
				</ul>
			)}
		</section>
	);
};

export default AdminUserActivity;
