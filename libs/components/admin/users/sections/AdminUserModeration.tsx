import React from 'react';

import { useTranslation } from 'next-i18next';

import { useRouter } from 'next/router';

import type { AdminUser, UserModerationEntry } from '../../../../types/admin/admin';

import { dateLocale } from '../../../../utils/i18nLocale';



interface Props {

	user: AdminUser;

	moderationHistory: UserModerationEntry[];

}



const AdminUserModeration: React.FC<Props> = ({ user, moderationHistory }) => {

	const { t } = useTranslation('admin');

	const router = useRouter();

	const locale = dateLocale(router.locale);



	const formatDate = (value: string) =>

		new Date(value).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });



	return (

		<section id="moderation" className="fixora-admin-user-section">

			<h3 className="fixora-admin-user-section__title">{t('userDetail.sections.moderation')}</h3>



			<dl className="fixora-admin-user-kv">

				<div className="fixora-admin-user-kv__row">

					<dt>{t('userDetail.moderation.accountStatus')}</dt>

					<dd>{t(`users.statuses.${user.userStatus}`)}</dd>

				</div>

				<div className="fixora-admin-user-kv__row">

					<dt>{t('userDetail.moderation.isBlocked')}</dt>

					<dd>{user.isBlocked ? t('common.yes') : t('common.no')}</dd>

				</div>

				{user.deletedAt && (

					<div className="fixora-admin-user-kv__row">

						<dt>{t('userDetail.moderation.deletedAt')}</dt>

						<dd>{new Date(user.deletedAt).toLocaleString()}</dd>

					</div>

				)}

			</dl>



			<button

				type="button"

				className="fixora-admin-btn fixora-admin-btn--ghost fixora-admin-btn--sm"

				onClick={() => router.push('/_admin/moderation')}

			>

				{t('userDetail.moderation.openModeration')}

			</button>



			<h4 className="fixora-admin-user-section__subtitle">{t('userDetail.moderation.history')}</h4>

			{moderationHistory.length === 0 ? (

				<p className="fixora-admin-muted">{t('userDetail.moderation.noHistory')}</p>

			) : (

				<ul className="fixora-admin-user-list">

					{moderationHistory.map((entry) => (

						<li key={entry._id} className="fixora-admin-user-list__item">

							<strong>

								{entry.action}

								{entry.category ? ` · ${entry.category}` : ''}

							</strong>

							<p>{entry.reason}</p>

							<span>

								{formatDate(entry.createdAt)}

								{entry.adminData?.userNickname || entry.adminData?.userFullName

									? ` · ${entry.adminData.userNickname || entry.adminData.userFullName}`

									: ''}

							</span>

						</li>

					))}

				</ul>

			)}

		</section>

	);

};



export default AdminUserModeration;

