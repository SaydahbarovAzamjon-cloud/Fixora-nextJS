import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import AddOutlined from '@mui/icons-material/AddOutlined';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import FavoriteBorderOutlined from '@mui/icons-material/FavoriteBorderOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import RemoveRedEyeOutlined from '@mui/icons-material/RemoveRedEyeOutlined';
import { userVar } from '../../../../apollo/store';
import { GET_MY_ARTICLES } from '../../../../apollo/user/profile';
import { DELETE_ARTICLE } from '../../../../apollo/user/article';
import { Article, ArticleStatus } from '../../../types/fixora/fixora';
import { removeArticleLocalSettings } from '../../../utils/articleLocalSettings';
import MyArticleCard from './MyArticleCard';
import ArticleCommentsModal from './ArticleCommentsModal';

type StatusFilter = 'ALL' | ArticleStatus;

const PAGE_SIZE = 12;

const MyArticlesPage: React.FC = () => {
	const { t, i18n } = useTranslation('technician');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [commentsArticle, setCommentsArticle] = useState<Article | null>(null);

	const search = useMemo(() => {
		if (statusFilter === 'ALL') return {};
		return { articleStatus: statusFilter };
	}, [statusFilter]);

	const { data, loading, error, refetch } = useQuery(GET_MY_ARTICLES, {
		variables: { input: { page: 1, limit: PAGE_SIZE, search } },
		skip: !user?._id,
		fetchPolicy: 'cache-and-network',
	});

	const [deleteArticle] = useMutation(DELETE_ARTICLE);

	const articles: Article[] = data?.getMyArticles?.list ?? [];
	const total = data?.getMyArticles?.metaCounter?.[0]?.total ?? articles.length;

	const summary = useMemo(() => {
		return articles.reduce(
			(acc, a) => ({
				likes: acc.likes + (a.articleLikes ?? 0),
				views: acc.views + (a.articleViews ?? 0),
				comments: acc.comments + (a.articleComments ?? 0),
			}),
			{ likes: 0, views: 0, comments: 0 },
		);
	}, [articles]);

	const handleDelete = async (id: string) => {
		const confirmed = await sweetConfirmAlert(t('myArticles.deleteConfirm'));
		if (!confirmed) return;

		setDeletingId(id);
		try {
			await deleteArticle({ variables: { articleId: id } });
			removeArticleLocalSettings(id);
			await sweetMixinSuccessAlert(t('myArticles.deleteSuccess'), 2000);
			await refetch();
		} catch (err) {
			await sweetErrorHandling(err);
		} finally {
			setDeletingId(null);
		}
	};

	const filters: { id: StatusFilter; labelKey: string }[] = [
		{ id: 'ALL', labelKey: 'myArticles.filters.all' },
		{ id: 'PUBLISHED', labelKey: 'myArticles.filters.published' },
		{ id: 'DRAFT', labelKey: 'myArticles.filters.draft' },
	];

	if (!user?._id) {
		return (
			<div className="ftma-page ftma-page--empty">
				<p>{t('myArticles.loading')}</p>
			</div>
		);
	}

	return (
		<div className="ftma-page">
			<div className="ftma-page__header">
				<div className="ftma-page__header-left">
					<div className="ftma-page__icon">
						<ArticleOutlined style={{ fontSize: 18, color: '#fff' }} />
					</div>
					<div>
						<h1 className="ftma-page__title">{t('myArticles.pageTitle')}</h1>
						<p className="ftma-page__subtitle">{t('myArticles.pageSubtitle')}</p>
					</div>
				</div>
				<button type="button" className="ftma-page__cta" onClick={() => router.push('/technician/write')}>
					<AddOutlined style={{ fontSize: 16 }} />
					{t('myArticles.newArticle')}
				</button>
			</div>

			<div className="ftma-summary">
				<div className="ftma-summary__item">
					<span className="ftma-summary__value">{total}</span>
					<span className="ftma-summary__label">{t('myArticles.summary.articles')}</span>
				</div>
				<div className="ftma-summary__item">
					<FavoriteBorderOutlined style={{ fontSize: 14, color: '#FF6B00' }} />
					<span className="ftma-summary__value">{summary.likes}</span>
					<span className="ftma-summary__label">{t('myArticles.summary.likes')}</span>
				</div>
				<div className="ftma-summary__item">
					<RemoveRedEyeOutlined style={{ fontSize: 14, color: '#808080' }} />
					<span className="ftma-summary__value">{summary.views}</span>
					<span className="ftma-summary__label">{t('myArticles.summary.views')}</span>
				</div>
				<div className="ftma-summary__item">
					<ChatBubbleOutlineOutlined style={{ fontSize: 14, color: '#3B82F6' }} />
					<span className="ftma-summary__value">{summary.comments}</span>
					<span className="ftma-summary__label">{t('myArticles.summary.comments')}</span>
				</div>
			</div>

			<div className="ftma-filters">
				{filters.map(({ id, labelKey }) => (
					<button
						key={id}
						type="button"
						className={`ftma-filter ${statusFilter === id ? 'ftma-filter--active' : ''}`}
						onClick={() => setStatusFilter(id)}
					>
						{t(labelKey)}
					</button>
				))}
			</div>

			{loading && articles.length === 0 && (
				<div className="ftma-grid ftma-grid--loading">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="ftma-skeleton" />
					))}
				</div>
			)}

			{error && (
				<div className="ftma-empty">
					<p>{t('myArticles.error')}</p>
					<button type="button" className="ftma-page__cta" onClick={() => refetch()}>
						{t('myArticles.retry')}
					</button>
				</div>
			)}

			{!loading && !error && articles.length === 0 && (
				<div className="ftma-empty">
					<div className="ftma-empty__icon">
						<ArticleOutlined style={{ fontSize: 32, color: '#606060' }} />
					</div>
					<h2>{t('myArticles.emptyTitle')}</h2>
					<p>{t('myArticles.emptySub')}</p>
					<button type="button" className="ftma-page__cta" onClick={() => router.push('/technician/write')}>
						<AddOutlined style={{ fontSize: 16 }} />
						{t('myArticles.newArticle')}
					</button>
				</div>
			)}

			{articles.length > 0 && (
				<div className="ftma-grid fixora-home-tips__grid">
					{articles.map((article) => (
						<MyArticleCard
							key={article._id}
							article={article}
							onEdit={(id) => router.push(`/technician/write?edit=${id}`)}
							onDelete={handleDelete}
							onViewComments={setCommentsArticle}
							deleting={deletingId === article._id}
						/>
					))}
				</div>
			)}

			<ArticleCommentsModal
				open={!!commentsArticle}
				articleId={commentsArticle?._id ?? ''}
				articleTitle={commentsArticle?.articleTitle ?? ''}
				onClose={() => setCommentsArticle(null)}
				locale={i18n.language}
			/>
		</div>
	);
};

export default MyArticlesPage;
