import React from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import type { AdminUser } from '../../../../types/admin/admin';
import { dateLocale } from '../../../../utils/i18nLocale';

interface Props {
	user: AdminUser;
}

const AdminUserOverview: React.FC<Props> = ({ user }) => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const locale = dateLocale(router.locale);

	const formatDate = (value?: string) =>
		value
			? new Date(value).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })
			: '—';

	const rows: { label: string; value: string }[] = [
		{ label: t('userDetail.overview.email'), value: user.userEmail || '—' },
		{ label: t('userDetail.overview.phone'), value: user.userPhoneNumber || '—' },
		{ label: t('userDetail.overview.location'), value: user.userLocation || '—' },
		{ label: t('userDetail.overview.joined'), value: formatDate(user.createdAt) },
		{ label: t('userDetail.overview.lastLogin'), value: formatDate(user.lastLoginAt) },
		{ label: t('userDetail.overview.status'), value: t(`users.statuses.${user.userStatus}`) },
		{
			label: t('userDetail.overview.verification'),
			value: user.verificationStatus,
		},
		{
			label: t('userDetail.overview.premium'),
			value: user.badgeLevel === 'PREMIUM_PRO' ? t('userDetail.badges.PREMIUM_PRO') : '—',
		},
	];

	if (user.userType === 'TECHNICIAN') {
		rows.push(
			{ label: t('verification.fields.shop'), value: user.shopName || '—' },
			{ label: t('verification.fields.specialty'), value: user.specialty || '—' },
		);
	}

	return (
		<section id="overview" className="fixora-admin-user-section">
			<h3 className="fixora-admin-user-section__title">{t('userDetail.sections.overview')}</h3>
			{user.userBio && <p className="fixora-admin-user-section__bio">{user.userBio}</p>}
			<dl className="fixora-admin-user-kv">
				{rows.map((row) => (
					<div key={row.label} className="fixora-admin-user-kv__row">
						<dt>{row.label}</dt>
						<dd>{row.value}</dd>
					</div>
				))}
			</dl>
		</section>
	);
};

export default AdminUserOverview;
