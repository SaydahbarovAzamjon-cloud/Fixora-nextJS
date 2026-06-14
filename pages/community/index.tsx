import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import Pagination from '@mui/material/Pagination';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { GET_ARTICLES } from '../../apollo/user/query';
import { LIKE_TARGET_ARTICLE } from '../../apollo/user/article';
import { userVar } from '../../apollo/store';
import { Article, ArticleCategory } from '../../libs/types/fixora/fixora';
import { FixoraButton } from '../../libs/components/ui';
import CategoryTabs from '../../libs/components/community/fixora/CategoryTabs';
import ArticleCard from '../../libs/components/community/fixora/ArticleCard';
import { sweetErrorHandling } from '../../libs/sweetAlert';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const PAGE_SIZE = 6;

const CommunityPage: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [category, setCategory] = useState<ArticleCategory>('FREE');
	const [page, setPage] = useState(1);
	const [articles, setArticles] = useState<Article[]>([]);
	const [likePendingId, setLikePendingId] = useState<string | null>(null);

	/** APOLLO REQUESTS **/
	const { data, loading, refetch } = useQuery(GET_ARTICLES, {
		variables: {
			input: {
				page,
				limit: PAGE_SIZE,
				sort: 'createdAt',
				direction: 'DESC',
				search: {
					articleCategory: category,
				},
			},
		},
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
		onCompleted: (result) => {
			const list: Article[] = result?.getArticles?.list ?? [];
			setArticles(list);
		},
	});

	const total: number = data?.getArticles?.metaCounter?.[0]?.total ?? 0;

	const [likeArticle] = useMutation(LIKE_TARGET_ARTICLE);

	/** HANDLERS **/
	const handleCategoryChange = (newCategory: ArticleCategory) => {
		setCategory(newCategory);
		setPage(1);
	};

	const handlePageChange = (event: any, value: number) => {
		setPage(value);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handleNewPost = async () => {
		if (!user?._id) {
			await sweetErrorHandling(new Error('Please log in to create a post'));
			return;
		}
		router.push('/community/write');
	};

	const handleLike = async (articleId: string) => {
		if (!user?._id) {
			await sweetErrorHandling(new Error('Please log in to like a post'));
			return;
		}

		setLikePendingId(articleId);
		try {
			await likeArticle({
				variables: { input: articleId },
				refetchQueries: [
					{
						query: GET_ARTICLES,
						variables: {
							input: {
								page,
								limit: PAGE_SIZE,
								sort: 'createdAt',
								direction: 'DESC',
								search: { articleCategory: category },
							},
						},
					},
				],
			});
		} catch (err: any) {
			await sweetErrorHandling(err);
		} finally {
			setLikePendingId(null);
		}
	};

	return (
		<div className="fixora-community-page">
			<div className="fixora-community">
				{/* Header */}
				<div className="fixora-community__header">
					<h1 className="fixora-community__title">Community</h1>
					<FixoraButton variant="primary" onClick={handleNewPost}>
						New Post
					</FixoraButton>
				</div>

				{/* Category Tabs */}
				<CategoryTabs value={category} onChange={handleCategoryChange} />

				{/* Feed */}
				{loading && articles.length === 0 ? (
					<div className="fixora-community__loading">Loading articles...</div>
				) : articles.length === 0 ? (
					<div className="fixora-community__empty">
						<p>No articles in this category yet</p>
					</div>
				) : (
					<div className="fixora-community__feed">
						{articles.map((article) => (
							<ArticleCard
								key={article._id}
								article={article}
								onLike={handleLike}
								likePending={likePendingId === article._id}
							/>
						))}
					</div>
				)}

				{/* Pagination */}
				{total > PAGE_SIZE && (
					<div className="fixora-community__pagination">
						<Pagination
							count={Math.ceil(total / PAGE_SIZE)}
							page={page}
							onChange={handlePageChange}
							color="primary"
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default withLayoutFull(CommunityPage);
