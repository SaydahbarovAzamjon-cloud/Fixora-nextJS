import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import AdminPagination from '../shared/AdminPagination';
import AdminStatusBadge from '../shared/AdminStatusBadge';
import AdminModerationArticleThumb from './AdminModerationArticleThumb';
import AdminModerationArticleActions from './AdminModerationArticleActions';
import AdminModerationArticleModal from './AdminModerationArticleModal';
import { GET_ALL_ARTICLES_BY_ADMIN } from '../../../../apollo/admin/query';
import { REMOVE_ARTICLE_BY_ADMIN } from '../../../../apollo/admin/mutation';
import type { AdminArticle } from '../../../types/admin/admin';
import { displayUserName } from '../../../hooks/useUserLookup';
import { resolveProfileImageUrl } from '../../../utils/profileImage';
import { dateLocale } from '../../../utils/i18nLocale';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../sweetAlert';

const PAGE_SIZE = 10;

const articleStatusTone = (status: string) => {
	switch (status) {
		case 'PUBLISHED':
		case 'ACTIVE':
			return 'success' as const;
		case 'DRAFT':
			return 'warning' as const;
		case 'DELETE':
			return 'danger' as const;
		default:
			return 'neutral' as const;
	}
};

const AdminModerationArticlesTab: React.FC = () => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const [page, setPage] = useState(1);
	const [viewArticleId, setViewArticleId] = useState<string | null>(null);

	const { data, loading, refetch } = useQuery(GET_ALL_ARTICLES_BY_ADMIN, {
		variables: { input: { page, limit: PAGE_SIZE, search: {} } },
		fetchPolicy: 'cache-and-network',
	});

	const [removeArticle] = useMutation(REMOVE_ARTICLE_BY_ADMIN);

	const articles: AdminArticle[] = data?.getAllArticlesByAdmin?.list ?? [];
	const total = data?.getAllArticlesByAdmin?.metaCounter?.[0]?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	const handleDelete = async (articleId: string) => {
		if (!window.confirm(t('moderation.articles.modal.confirmDelete'))) return;
		try {
			await removeArticle({ variables: { articleId } });
			await sweetTopSmallSuccessAlert(t('common.success'), 1200);
			await refetch();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const openPublicArticle = (articleId: string) => {
		window.open(`/community/${articleId}`, '_blank', 'noopener,noreferrer');
	};

	return (
		<>
			<div className="fixora-admin-table-wrap">
				<table className="fixora-admin-table">
					<thead>
						<tr>
							<th>{t('moderation.articles.columns.article')}</th>
							<th>{t('moderation.articles.columns.author')}</th>
							<th>{t('moderation.articles.columns.category')}</th>
							<th>{t('moderation.articles.columns.status')}</th>
							<th>{t('moderation.articles.columns.views')}</th>
							<th>{t('moderation.articles.columns.likes')}</th>
							<th>{t('moderation.articles.columns.comments')}</th>
							<th>{t('moderation.articles.columns.created')}</th>
							<th>{t('moderation.articles.columns.actions')}</th>
						</tr>
					</thead>
					<tbody>
						{loading && (
							<tr>
								<td colSpan={9} className="fixora-admin-empty">
									{t('common.loading')}
								</td>
							</tr>
						)}
						{!loading && articles.length === 0 && (
							<tr>
								<td colSpan={9} className="fixora-admin-empty">
									{t('moderation.articles.empty')}
								</td>
							</tr>
						)}
						{articles.map((article) => {
							const author = article.authorData;
							const authorName = displayUserName(author);
							return (
								<tr key={article._id}>
									<td>
										<div className="fixora-admin-article-cell">
											<AdminModerationArticleThumb
												image={article.articleImage}
												title={article.articleTitle}
											/>
											<div className="fixora-admin-article-cell__body">
												<p className="fixora-admin-article-cell__title">{article.articleTitle}</p>
												{article.articleExcerpt ? (
													<p className="fixora-admin-article-cell__excerpt">{article.articleExcerpt}</p>
												) : (
													<p className="fixora-admin-article-cell__excerpt fixora-admin-article-cell__excerpt--empty">
														{t('moderation.articles.noExcerpt')}
													</p>
												)}
											</div>
										</div>
									</td>
									<td>
										<div className="fixora-admin-author-cell">
											<div className="fixora-admin-table-user">
												<div className="fixora-admin-table-user__avatar">
													<img src={resolveProfileImageUrl(author?.userProfileImage)} alt="" />
												</div>
												<div className="fixora-admin-author-cell__text">
													<span className="fixora-admin-author-cell__name">{authorName}</span>
													{author?.userNickname ? (
														<span className="fixora-admin-author-cell__handle">@{author.userNickname}</span>
													) : null}
												</div>
											</div>
										</div>
									</td>
									<td>
										{article.articleCategory && (
											<AdminStatusBadge label={article.articleCategory} tone="neutral" />
										)}
									</td>
									<td>
										<AdminStatusBadge
											label={article.articleStatus}
											tone={articleStatusTone(article.articleStatus)}
										/>
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
										<AdminModerationArticleActions
											onView={() => setViewArticleId(article._id)}
											onEdit={() => openPublicArticle(article._id)}
											onModerate={() => setViewArticleId(article._id)}
											onDelete={() => handleDelete(article._id)}
										/>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />

			<AdminModerationArticleModal
				articleId={viewArticleId}
				open={!!viewArticleId}
				onClose={() => setViewArticleId(null)}
				onUpdated={() => refetch()}
			/>
		</>
	);
};

export default AdminModerationArticlesTab;
