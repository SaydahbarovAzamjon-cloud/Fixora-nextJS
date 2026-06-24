import React from 'react';

import { useTranslation } from 'next-i18next';

import type { AdminUserComment, StoryReport } from '../../../../types/admin/admin';



interface Props {

	articles: { _id: string; articleTitle?: string; articleViews?: number; articleLikes?: number; createdAt: string }[];

	stories: { _id: string; caption?: string; viewCount?: number; createdAt: string }[];

	commentsByUser: AdminUserComment[];

	reportsReceived: StoryReport[];

	userLikes?: number;

	userArticles?: number;

	loading?: boolean;

}



const AdminUserContent: React.FC<Props> = ({

	articles,

	stories,

	commentsByUser,

	reportsReceived,

	userLikes,

	userArticles,

	loading,

}) => {

	const { t } = useTranslation('admin');



	return (

		<section id="content" className="fixora-admin-user-section">

			<h3 className="fixora-admin-user-section__title">{t('userDetail.sections.content')}</h3>

			{loading && <p className="fixora-admin-muted">{t('common.loading')}</p>}



			<div className="fixora-admin-stat-grid fixora-admin-stat-grid--compact">

				<div className="fixora-admin-stat-grid__item">

					<span className="fixora-admin-stat-grid__label">{t('userDetail.content.articles')}</span>

					<strong>{userArticles ?? articles.length}</strong>

				</div>

				<div className="fixora-admin-stat-grid__item">

					<span className="fixora-admin-stat-grid__label">{t('userDetail.content.stories')}</span>

					<strong>{stories.length}</strong>

				</div>

				<div className="fixora-admin-stat-grid__item">

					<span className="fixora-admin-stat-grid__label">{t('userDetail.content.likesReceived')}</span>

					<strong>{userLikes ?? 0}</strong>

				</div>

			</div>



			<h4 className="fixora-admin-user-section__subtitle">{t('userDetail.content.articlesList')}</h4>

			{articles.length === 0 ? (

				<p className="fixora-admin-muted">{t('userDetail.content.noArticles')}</p>

			) : (

				<ul className="fixora-admin-user-list">

					{articles.map((a) => (

						<li key={a._id} className="fixora-admin-user-list__item">

							<strong>{a.articleTitle}</strong>

							<span>

								{t('userDetail.content.viewsLikes', { views: a.articleViews ?? 0, likes: a.articleLikes ?? 0 })}

							</span>

						</li>

					))}

				</ul>

			)}



			{stories.length > 0 && (

				<>

					<h4 className="fixora-admin-user-section__subtitle">{t('userDetail.content.storiesList')}</h4>

					<ul className="fixora-admin-user-list">

						{stories.map((s) => (

							<li key={s._id} className="fixora-admin-user-list__item">

								<p>{s.caption || '—'}</p>

								<span>{t('userDetail.content.storyViews', { count: s.viewCount ?? 0 })}</span>

							</li>

						))}

					</ul>

				</>

			)}



			<h4 className="fixora-admin-user-section__subtitle">{t('userDetail.content.commentsByUser')}</h4>

			{commentsByUser.length === 0 ? (

				<p className="fixora-admin-muted">{t('userDetail.content.noComments')}</p>

			) : (

				<ul className="fixora-admin-user-list">

					{commentsByUser.map((c) => (

						<li key={c._id} className="fixora-admin-user-list__item">

							<p>{c.commentContent}</p>

							<span>

								{c.articleTitle || c.commentStatus} · {new Date(c.createdAt).toLocaleDateString()}

							</span>

						</li>

					))}

				</ul>

			)}



			<h4 className="fixora-admin-user-section__subtitle">{t('userDetail.content.reportsReceived')}</h4>

			{reportsReceived.length === 0 ? (

				<p className="fixora-admin-muted">{t('userDetail.content.noReports')}</p>

			) : (

				<ul className="fixora-admin-user-list">

					{reportsReceived.map((r) => (

						<li key={r._id} className="fixora-admin-user-list__item">

							<strong>

								{r.reason} · {r.status}

							</strong>

							{r.comment && <p>{r.comment}</p>}

							<span>{new Date(r.createdAt).toLocaleDateString()}</span>

						</li>

					))}

				</ul>

			)}

		</section>

	);

};



export default AdminUserContent;

