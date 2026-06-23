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
import AdminModerationArticlesTab from '../../../libs/components/admin/moderation/AdminModerationArticlesTab';
import { GET_ALL_COMMENTS_BY_ADMIN, GET_STORY, GET_STORY_REPORTS } from '../../../apollo/admin/query';
import {
	REMOVE_COMMENT_BY_ADMIN,
	REMOVE_STORY,
	REVIEW_STORY_REPORT,
	WARN_TECHNICIAN_FOR_STORY,
	UPDATE_USER_BY_ADMIN,
} from '../../../apollo/admin/mutation';
import type { AdminComment, StoryReport } from '../../../libs/types/admin/admin';
import { displayUserName } from '../../../libs/hooks/useUserLookup';
import { resolveProfileImageUrl } from '../../../libs/utils/profileImage';
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
			<div className="fixora-admin-moderation-card__header">
				<div className="fixora-admin-moderation-card__author">
					<div className="fixora-admin-table-user__avatar">
						{displayUserName(story?.userData).charAt(0)}
					</div>
					<strong>{displayUserName(story?.userData)}</strong>
				</div>
				{story?.expiresAt && (
					<span className="fixora-admin-verification__list-meta">
						{new Date(story.expiresAt).toLocaleString(dateLocale(router.locale))}
					</span>
				)}
			</div>
			{story?.caption && <p className="fixora-admin-moderation-card__caption">{story.caption}</p>}
			<div className="fixora-admin-moderation-card__stats">
				<span>{t('moderation.views', { count: story?.viewCount ?? 0 })}</span>
				<span className="fixora-admin-moderation-card__reports">
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

	const { data: commentsData, loading: commentsLoading, refetch: refetchComments } = useQuery(
		GET_ALL_COMMENTS_BY_ADMIN,
		{
			variables: { input: { page: 1, limit: 50, search: {} } },
			skip: tab !== 'comments',
			fetchPolicy: 'cache-and-network',
		},
	);

	const [removeComment] = useMutation(REMOVE_COMMENT_BY_ADMIN);

	const reports: StoryReport[] = reportsData?.getStoryReports?.list ?? [];
	const comments: AdminComment[] = commentsData?.getAllCommentsByAdmin?.list ?? [];
	const reportCount = reportsData?.getStoryReports?.metaCounter?.[0]?.total ?? 0;

	const tabs = [
		{ id: 'stories', label: t('moderation.tabs.stories'), badge: reportCount },
		{ id: 'articles', label: t('moderation.tabs.articles') },
		{ id: 'comments', label: t('moderation.tabs.comments') },
	];

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

				{tab === 'articles' && <AdminModerationArticlesTab />}

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
										<td className="fixora-admin-cell-ellipsis fixora-admin-cell-ellipsis--wide">{comment.commentContent}</td>
										<td>
											<div className="fixora-admin-table-user">
												<div className="fixora-admin-table-user__avatar">
													<img
														src={resolveProfileImageUrl(comment.authorData?.userProfileImage)}
														alt=""
													/>
												</div>
												<span className="fixora-admin-table-user__name">
													{comment.authorData?.userNickname ?? '—'}
												</span>
											</div>
										</td>
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
