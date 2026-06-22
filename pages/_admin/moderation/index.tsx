import React, { useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { AlertTriangle, Trash2, Shield } from 'lucide-react';
import withAdminLayout from '../../../libs/components/layout/AdminLayout';
import { adminPageProps } from '../../../libs/i18n/adminPageProps';
import AdminHeader from '../../../libs/components/admin/AdminHeader';
import AdminFilterTabs from '../../../libs/components/admin/shared/AdminFilterTabs';
import AdminStatusBadge from '../../../libs/components/admin/shared/AdminStatusBadge';
import { GET_ALL_ARTICLES_BY_ADMIN, GET_ALL_COMMENTS_BY_ADMIN, GET_STORY, GET_STORY_REPORTS } from '../../../apollo/admin/query';
import {
	REMOVE_ARTICLE_BY_ADMIN,
	REMOVE_COMMENT_BY_ADMIN,
	REMOVE_STORY,
	REVIEW_STORY_REPORT,
	WARN_TECHNICIAN_FOR_STORY,
	UPDATE_USER_BY_ADMIN,
} from '../../../apollo/admin/mutation';
import type { AdminArticle, AdminComment, StoryReport } from '../../../libs/types/admin/admin';
import { displayUserName } from '../../../libs/hooks/useUserLookup';
import { dateLocale } from '../../../libs/utils/i18nLocale';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';

type ModTab = 'stories' | 'articles' | 'comments';

const StoryReportCard: React.FC<{ report: StoryReport; onDone: () => void }> = ({ report, onDone }) => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const { data: storyData } = useQuery(GET_STORY, {
		variables: { storyId: report.storyId },
		skip: !report.storyId,
	});
	const story = storyData?.getStory;

	const [removeStory] = useMutation(REMOVE_STORY);
	const [reviewReport] = useMutation(REVIEW_STORY_REPORT);
	const [warnTechnician] = useMutation(WARN_TECHNICIAN_FOR_STORY);
	const [updateUser] = useMutation(UPDATE_USER_BY_ADMIN);

	const run = async (action: () => Promise<unknown>) => {
		try {
			await action();
			await sweetTopSmallSuccessAlert(t('common.success'), 1200);
			onDone();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<div className="fixora-admin-moderation-card">
			<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
				<div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
					<div className="fixora-admin-table-user__avatar">
						{displayUserName(story?.userData).charAt(0)}
					</div>
					<strong>{displayUserName(story?.userData)}</strong>
				</div>
				{story?.expiresAt && (
					<span style={{ fontSize: 12, color: 'var(--fixora-text-muted)' }}>
						{new Date(story.expiresAt).toLocaleString(dateLocale(router.locale))}
					</span>
				)}
			</div>
			{story?.caption && (
				<p style={{ fontSize: 14, color: 'var(--fixora-text-secondary)', marginBottom: 12 }}>{story.caption}</p>
			)}
			<div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--fixora-text-muted)', marginBottom: 12 }}>
				<span>{t('moderation.views', { count: story?.viewCount ?? 0 })}</span>
				<span style={{ color: '#e85a6f', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
					<AlertTriangle size={12} /> {t('moderation.reports', { count: story?.reportCount ?? 1 })}
				</span>
			</div>
			<AdminStatusBadge
				label={t(`moderation.reasons.${report.reason}` as 'moderation.reasons.OTHER', { defaultValue: report.reason })}
				tone="danger"
			/>
			<div className="fixora-admin-moderation-card__actions">
				<button
					type="button"
					className="fixora-admin-btn fixora-admin-btn--danger-outline fixora-admin-btn--sm"
					onClick={() =>
						run(async () => {
							await removeStory({ variables: { storyId: report.storyId } });
							await reviewReport({ variables: { input: { reportId: report._id, status: 'ACTIONED' } } });
						})
					}
				>
					<Trash2 size={14} /> {t('moderation.actions.remove')}
				</button>
				<button
					type="button"
					className="fixora-admin-btn fixora-admin-btn--outline fixora-admin-btn--sm"
					onClick={() =>
						run(() =>
							warnTechnician({
								variables: { input: { storyId: report.storyId, reason: report.reason } },
							}),
						)
					}
				>
					<AlertTriangle size={14} /> {t('moderation.actions.warn')}
				</button>
				<button
					type="button"
					className="fixora-admin-btn fixora-admin-btn--danger-outline fixora-admin-btn--sm"
					onClick={() =>
						run(() =>
							updateUser({
								variables: { input: { _id: report.userId, userStatus: 'BLOCK' } },
							}),
						)
					}
				>
					<Shield size={14} /> {t('moderation.actions.suspend')}
				</button>
				<button
					type="button"
					className="fixora-admin-btn fixora-admin-btn--outline fixora-admin-btn--sm"
					onClick={() =>
						run(() =>
							reviewReport({ variables: { input: { reportId: report._id, status: 'DISMISSED' } } }),
						)
					}
				>
					{t('moderation.actions.dismiss')}
				</button>
			</div>
		</div>
	);
};

const AdminModerationPage: NextPage = () => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const [tab, setTab] = useState<ModTab>('stories');

	const { data: reportsData, refetch: refetchReports } = useQuery(GET_STORY_REPORTS, {
		variables: { input: { status: 'PENDING' } },
		skip: tab !== 'stories',
		fetchPolicy: 'cache-and-network',
	});

	const { data: articlesData, loading: articlesLoading, refetch: refetchArticles } = useQuery(
		GET_ALL_ARTICLES_BY_ADMIN,
		{
			variables: { input: { page: 1, limit: 50, search: {} } },
			skip: tab !== 'articles',
			fetchPolicy: 'cache-and-network',
		},
	);

	const { data: commentsData, loading: commentsLoading, refetch: refetchComments } = useQuery(
		GET_ALL_COMMENTS_BY_ADMIN,
		{
			variables: { input: { page: 1, limit: 50, search: {} } },
			skip: tab !== 'comments',
			fetchPolicy: 'cache-and-network',
		},
	);

	const [removeArticle] = useMutation(REMOVE_ARTICLE_BY_ADMIN);
	const [removeComment] = useMutation(REMOVE_COMMENT_BY_ADMIN);

	const reports: StoryReport[] = reportsData?.getStoryReports?.list ?? [];
	const articles: AdminArticle[] = articlesData?.getAllArticlesByAdmin?.list ?? [];
	const comments: AdminComment[] = commentsData?.getAllCommentsByAdmin?.list ?? [];
	const reportCount = reportsData?.getStoryReports?.metaCounter?.[0]?.total ?? 0;

	const tabs = [
		{ id: 'stories', label: t('moderation.tabs.stories'), badge: reportCount },
		{ id: 'articles', label: t('moderation.tabs.articles') },
		{ id: 'comments', label: t('moderation.tabs.comments') },
	];

	const handleRemoveArticle = async (articleId: string) => {
		try {
			await removeArticle({ variables: { articleId } });
			await sweetTopSmallSuccessAlert(t('common.success'), 1200);
			await refetchArticles();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const handleRemoveComment = async (commentId: string) => {
		try {
			await removeComment({ variables: { commentId } });
			await sweetTopSmallSuccessAlert(t('common.success'), 1200);
			await refetchComments();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<>
			<AdminHeader title={t('moderation.title')} subtitle={t('moderation.subtitle')} />
			<div className="fixora-admin-page">
				<AdminFilterTabs tabs={tabs} activeId={tab} onChange={(id) => setTab(id as ModTab)} />

				{tab === 'stories' && (
					<>
						{reports.length === 0 && <div className="fixora-admin-empty">{t('moderation.empty')}</div>}
						{reports.map((report) => (
							<StoryReportCard key={report._id} report={report} onDone={() => refetchReports()} />
						))}
					</>
				)}

				{tab === 'articles' && (
					<div className="fixora-admin-table-wrap">
						<table className="fixora-admin-table">
							<thead>
								<tr>
									<th>{t('moderation.articles.columns.title')}</th>
									<th>{t('moderation.articles.columns.author')}</th>
									<th>{t('moderation.articles.columns.category')}</th>
									<th>{t('moderation.articles.columns.status')}</th>
									<th>{t('moderation.articles.columns.views')}</th>
									<th>{t('moderation.articles.columns.likes')}</th>
									<th>{t('moderation.articles.columns.comments')}</th>
									<th>{t('moderation.articles.columns.created')}</th>
									<th />
								</tr>
							</thead>
							<tbody>
								{articlesLoading && (
									<tr>
										<td colSpan={9} className="fixora-admin-empty">
											{t('common.loading')}
										</td>
									</tr>
								)}
								{!articlesLoading && articles.length === 0 && (
									<tr>
										<td colSpan={9} className="fixora-admin-empty">
											{t('moderation.articles.empty')}
										</td>
									</tr>
								)}
								{articles.map((article) => (
									<tr key={article._id}>
										<td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
											{article.articleTitle}
										</td>
										<td>{displayUserName(article.authorData)}</td>
										<td>
											{article.articleCategory && (
												<AdminStatusBadge label={article.articleCategory} tone="neutral" />
											)}
										</td>
										<td>
											<AdminStatusBadge label={article.articleStatus} tone="success" />
										</td>
										<td>{article.articleViews.toLocaleString()}</td>
										<td>{article.articleLikes}</td>
										<td>{article.articleComments}</td>
										<td>
											{new Date(article.createdAt).toLocaleDateString(dateLocale(router.locale), {
												year: 'numeric',
												month: '2-digit',
												day: '2-digit',
											})}
										</td>
										<td>
											<button
												type="button"
												className="fixora-admin-btn fixora-admin-btn--danger-outline fixora-admin-btn--sm"
												onClick={() => handleRemoveArticle(article._id)}
											>
												{t('moderation.actions.remove')}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{tab === 'comments' && (
					<div className="fixora-admin-table-wrap">
						<table className="fixora-admin-table">
							<thead>
								<tr>
									<th>{t('moderation.comments.columns.content')}</th>
									<th>{t('moderation.comments.columns.author')}</th>
									<th>{t('moderation.comments.columns.article')}</th>
									<th>{t('moderation.comments.columns.status')}</th>
									<th>{t('moderation.comments.columns.date')}</th>
									<th>{t('moderation.comments.columns.actions')}</th>
								</tr>
							</thead>
							<tbody>
								{commentsLoading && (
									<tr>
										<td colSpan={6} className="fixora-admin-empty">
											{t('common.loading')}
										</td>
									</tr>
								)}
								{!commentsLoading && comments.length === 0 && (
									<tr>
										<td colSpan={6} className="fixora-admin-empty">
											{t('moderation.comments.empty')}
										</td>
									</tr>
								)}
								{comments.map((comment) => (
									<tr key={comment._id}>
										<td style={{ maxWidth: 280 }}>{comment.commentContent}</td>
										<td>{comment.authorData?.userNickname ?? '—'}</td>
										<td>{comment.articleTitle ?? comment.commentRefId}</td>
										<td>
											<AdminStatusBadge label={comment.commentStatus} tone="neutral" />
										</td>
										<td>
											{new Date(comment.createdAt).toLocaleDateString(dateLocale(router.locale), {
												year: 'numeric',
												month: '2-digit',
												day: '2-digit',
											})}
										</td>
										<td>
											<button
												type="button"
												className="fixora-admin-btn fixora-admin-btn--danger-outline fixora-admin-btn--sm"
												onClick={() => handleRemoveComment(comment._id)}
											>
												{t('moderation.actions.remove')}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</>
	);
};

export const getServerSideProps = adminPageProps;

export default withAdminLayout(AdminModerationPage, { title: 'Moderation' });
