import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useReactiveVar } from '@apollo/client';
import Pagination from '@mui/material/Pagination';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { userVar } from '../../apollo/store';
import { FixoraButton } from '../../libs/components/ui';
import CategoryTabs from '../../libs/components/community/fixora/CategoryTabs';
import CommunitySearchInput from '../../libs/components/community/fixora/CommunitySearchInput';
import FeaturedArticleCard from '../../libs/components/community/fixora/FeaturedArticleCard';
import ArticleFeedCard from '../../libs/components/community/fixora/ArticleFeedCard';
import ArticleDetailModal from '../../libs/components/community/fixora/ArticleDetailModal';
import { COMMUNITY_PAGE_SIZE, useCommunityFeed } from '../../libs/hooks/useCommunityFeed';
import { sweetErrorHandling } from '../../libs/sweetAlert';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const CommunityPage: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const {
		categoryFilter,
		searchInput,
		setSearchInput,
		page,
		total,
		loading,
		feedArticles,
		featuredArticle,
		selectedArticleId,
		likePendingId,
		handleCategoryChange,
		handlePageChange,
		openModal,
		closeModal,
		bumpViewCount,
		handleLike,
		handleToggleSave,
		isSaved,
	} = useCommunityFeed({ userId: user?._id });

	const handleNewPost = async () => {
		if (!user?._id) {
			await sweetErrorHandling(new Error(t('community.loginToPost')));
			return;
		}
		router.push('/community/write');
	};

	return (
		<div className="fixora-community-page">
			<div className="fixora-community">
				<div className="fixora-community__header">
					<div className="fixora-community__header-text">
						<h1 className="fixora-community__title">{t('community.title')}</h1>
						<p className="fixora-community__subtitle">{t('community.subtitle')}</p>
					</div>
					<FixoraButton variant="primary" onClick={handleNewPost}>
						{t('community.newPost')}
					</FixoraButton>
				</div>

				<CommunitySearchInput
					value={searchInput}
					onChange={setSearchInput}
					placeholder={t('community.searchPlaceholder')}
				/>

				<CategoryTabs value={categoryFilter} onChange={handleCategoryChange} />

				{loading && !featuredArticle && feedArticles.length === 0 ? (
					<div className="fixora-community__loading">{t('community.loading')}</div>
				) : !featuredArticle && feedArticles.length === 0 ? (
					<div className="fixora-community__empty">
						<p>{t('community.empty')}</p>
					</div>
				) : (
					<>
						{featuredArticle && (
							<FeaturedArticleCard
								article={featuredArticle}
								onOpen={openModal}
								onLike={handleLike}
								onToggleSave={handleToggleSave}
								isSaved={isSaved(featuredArticle._id)}
								likePending={likePendingId === featuredArticle._id}
							/>
						)}

						{feedArticles.length > 0 && (
							<div className="fixora-community__feed-list">
								{feedArticles.map((article) => (
									<ArticleFeedCard
										key={article._id}
										article={article}
										onOpen={openModal}
										onLike={handleLike}
										onToggleSave={handleToggleSave}
										isSaved={isSaved(article._id)}
										likePending={likePendingId === article._id}
									/>
								))}
							</div>
						)}
					</>
				)}

				{total > COMMUNITY_PAGE_SIZE && (
					<div className="fixora-community__pagination">
						<Pagination
							count={Math.ceil(total / COMMUNITY_PAGE_SIZE)}
							page={page}
							onChange={handlePageChange}
							color="primary"
						/>
					</div>
				)}
			</div>

			<ArticleDetailModal
				articleId={selectedArticleId}
				open={!!selectedArticleId}
				onClose={closeModal}
				userId={user?._id}
				isSaved={isSaved}
				onToggleSave={handleToggleSave}
				onViewRecorded={bumpViewCount}
			/>
		</div>
	);
};

export default withLayoutFull(CommunityPage);
