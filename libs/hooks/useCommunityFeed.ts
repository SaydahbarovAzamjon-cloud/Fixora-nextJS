import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { GET_ARTICLES } from '../../apollo/user/query';
import {
	INCREMENT_ARTICLE_VIEW,
	LIKE_TARGET_ARTICLE,
	SAVE_ARTICLE,
	UNSAVE_ARTICLE,
} from '../../apollo/user/article';
import { Article } from '../types/fixora/fixora';
import { CommunityCategoryId, communityFilterToArticleCategory } from '../utils/communityCategories';
import { sweetErrorHandling } from '../sweetAlert';

export const COMMUNITY_PAGE_SIZE = 6;

export interface ArticleOverride {
	articleLikes?: number;
	articleViews?: number;
	meLiked?: Article['meLiked'];
	saved?: boolean;
}

export interface UseCommunityFeedOptions {
	userId?: string;
}

export function useCommunityFeed({ userId }: UseCommunityFeedOptions = {}) {
	const { t } = useTranslation('common');
	const [categoryFilter, setCategoryFilter] = useState<CommunityCategoryId>('all');
	const [searchInput, setSearchInput] = useState('');
	const [searchText, setSearchText] = useState('');
	const [page, setPage] = useState(1);
	const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
	const [likePendingId, setLikePendingId] = useState<string | null>(null);
	const [savePendingId, setSavePendingId] = useState<string | null>(null);
	const [overrides, setOverrides] = useState<Record<string, ArticleOverride>>({});

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setSearchText(searchInput.trim());
			setPage(1);
		}, 300);
		return () => window.clearTimeout(timer);
	}, [searchInput]);

	const articleCategory = communityFilterToArticleCategory(categoryFilter);

	const { data, loading, refetch } = useQuery(GET_ARTICLES, {
		variables: {
			input: {
				page,
				limit: COMMUNITY_PAGE_SIZE,
				sort: 'createdAt',
				direction: 'DESC',
				search: {
					...(articleCategory ? { articleCategory } : {}),
					...(searchText ? { text: searchText } : {}),
				},
			},
		},
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
	});

	const rawArticles: Article[] = data?.getArticles?.list ?? [];
	const total: number = data?.getArticles?.metaCounter?.[0]?.total ?? 0;

	const mergeArticle = useCallback(
		(article: Article): Article => {
			const patch = overrides[article._id];
			if (!patch) return article;
			return {
				...article,
				...(patch.articleLikes !== undefined ? { articleLikes: patch.articleLikes } : {}),
				...(patch.articleViews !== undefined ? { articleViews: patch.articleViews } : {}),
				...(patch.meLiked !== undefined ? { meLiked: patch.meLiked } : {}),
			};
		},
		[overrides],
	);

	const articles = useMemo(() => rawArticles.map(mergeArticle), [rawArticles, mergeArticle]);

	const featuredArticle = useMemo((): Article | null => {
		if (page !== 1 || articles.length === 0) return null;
		const flagged = articles.find((a) => a.isFeatured);
		return flagged ?? articles[0];
	}, [articles, page]);

	const feedArticles = useMemo(() => {
		if (!featuredArticle) return articles;
		return articles.filter((a) => a._id !== featuredArticle._id);
	}, [articles, featuredArticle]);

	const [likeArticleMutation] = useMutation(LIKE_TARGET_ARTICLE);
	const [saveArticleMutation] = useMutation(SAVE_ARTICLE);
	const [unsaveArticleMutation] = useMutation(UNSAVE_ARTICLE);
	const [incrementArticleViewMutation] = useMutation(INCREMENT_ARTICLE_VIEW);

	const handleCategoryChange = useCallback((filter: CommunityCategoryId) => {
		setCategoryFilter(filter);
		setPage(1);
	}, []);

	const handlePageChange = useCallback((_event: unknown, value: number) => {
		setPage(value);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, []);

	const openModal = useCallback((articleId: string) => {
		setSelectedArticleId(articleId);
	}, []);

	const closeModal = useCallback(() => {
		setSelectedArticleId(null);
	}, []);

	const bumpViewCount = useCallback(
		async (articleId: string, _baseViews: number) => {
			try {
				const result = await incrementArticleViewMutation({ variables: { articleId } });
				const updated = result.data?.incrementArticleView;
				if (updated) {
					setOverrides((prev) => ({
						...prev,
						[articleId]: {
							...prev[articleId],
							articleViews: updated.articleViews,
						},
					}));
				}
			} catch {
				/* public view tracking — ignore failures */
			}
		},
		[incrementArticleViewMutation],
	);

	const handleLike = useCallback(
		async (articleId: string) => {
			if (!userId) {
				await sweetErrorHandling(new Error(t('community.loginToLike')));
				return;
			}

			setLikePendingId(articleId);
			try {
				const result = await likeArticleMutation({
					variables: { input: articleId },
				});
				const updated = result.data?.likeTargetArticle;
				if (updated) {
					setOverrides((prev) => ({
						...prev,
						[articleId]: {
							...prev[articleId],
							articleLikes: updated.articleLikes,
							meLiked: updated.meLiked,
						},
					}));
				}
				await refetch();
			} catch (err) {
				await sweetErrorHandling(err);
			} finally {
				setLikePendingId(null);
			}
		},
		[userId, t, likeArticleMutation, refetch],
	);

	const handleToggleSave = useCallback(
		async (articleId: string) => {
			if (!userId) {
				await sweetErrorHandling(new Error(t('community.loginToSave')));
				return false;
			}

			const currentlySaved = isSavedState(articleId, rawArticles, overrides);
			setSavePendingId(articleId);
			try {
				const result = currentlySaved
					? await unsaveArticleMutation({ variables: { articleId } })
					: await saveArticleMutation({ variables: { articleId } });
				const updated = result.data?.saveArticle ?? result.data?.unsaveArticle;
				const saved = updated?.meSaved?.[0]?.mySaved ?? !currentlySaved;
				setOverrides((prev) => ({
					...prev,
					[articleId]: { ...prev[articleId], saved },
				}));
				return saved;
			} catch (err) {
				await sweetErrorHandling(err);
				return currentlySaved;
			} finally {
				setSavePendingId(null);
			}
		},
		[userId, t, rawArticles, overrides, saveArticleMutation, unsaveArticleMutation],
	);

	const isSaved = useCallback(
		(articleId: string) => isSavedState(articleId, rawArticles, overrides),
		[rawArticles, overrides],
	);

	return {
		categoryFilter,
		searchInput,
		setSearchInput,
		page,
		total,
		loading,
		articles,
		feedArticles,
		featuredArticle,
		selectedArticleId,
		likePendingId,
		savePendingId,
		handleCategoryChange,
		handlePageChange,
		openModal,
		closeModal,
		bumpViewCount,
		handleLike,
		handleToggleSave,
		isSaved,
	};
}

function isSavedState(
	articleId: string,
	articles: Article[],
	overrides: Record<string, ArticleOverride>,
): boolean {
	const patch = overrides[articleId];
	if (patch?.saved !== undefined) return patch.saved;
	const article = articles.find((a) => a._id === articleId);
	return article?.meSaved?.[0]?.mySaved ?? false;
}
