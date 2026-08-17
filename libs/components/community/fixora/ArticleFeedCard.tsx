import React, { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import { Article } from '../../../types/fixora/fixora';
import { useArticleCoverSrc } from '../../../hooks/useArticleCoverSrc';
import { estimateArticleReadMinutes } from '../../../utils/articleReadTime';
import { articleCategoryToCommunityFilter } from '../../../utils/communityCategories';
import { formatArticleCount, formatArticlePublishedAt } from '../../../utils/communityArticleDisplay';
import ArticleAuthorLink from './ArticleAuthorLink';

interface ArticleFeedCardProps {
	article: Article;
	onOpen: (articleId: string) => void;
	onLike: (articleId: string) => void;
	onToggleSave: (articleId: string) => void;
	isSaved: boolean;
	likePending?: boolean;
}

const ArticleFeedCard: React.FC<ArticleFeedCardProps> = ({
	article,
	onOpen,
	onLike,
	onToggleSave,
	isSaved,
	likePending = false,
}) => {
	const { t, i18n } = useTranslation('common');
	const { src: coverUrl, show: showCover, onError: onCoverError } = useArticleCoverSrc(
		article.articleImage,
	);
	const isLiked = article.meLiked?.[0]?.myFavorite ?? false;
	const readMinutes = estimateArticleReadMinutes(article);
	const categoryKey = article.articleCategory
		? `community.categories.${articleCategoryToCommunityFilter(article.articleCategory)}`
		: null;

	const author = article.authorData;
	const authorName = author?.userNickname || author?.userFullName || t('community.anonymousAuthor') || 'Author';

	const publishedAt = formatArticlePublishedAt(article.createdAt, i18n.language);

	const handleOpen = useCallback(() => onOpen(article._id), [article._id, onOpen]);

	const handleLike = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onLike(article._id);
		},
		[article._id, onLike],
	);

	const handleSave = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onToggleSave(article._id);
		},
		[article._id, onToggleSave],
	);

	return (
		<article
			className="fixora-community__feed-card"
			onClick={handleOpen}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleOpen();
				}
			}}
			role="button"
			tabIndex={0}
		>
			<div className="fixora-community__feed-card__media">
				{showCover ? (
					<img
						key={coverUrl}
						src={coverUrl}
						alt=""
						loading="lazy"
						onError={onCoverError}
					/>
				) : (
					<div className="fixora-community__feed-card__media-empty" aria-hidden="true">
						<ImageOutlined style={{ fontSize: 36, color: '#3A3A3A' }} />
					</div>
				)}
			</div>

			<div className="fixora-community__feed-card__body">
				<div className="fixora-community__feed-card__top">
					{categoryKey && (
						<span className="fixora-community__badge">{t(categoryKey)}</span>
					)}
					<span className="fixora-community__read-time">
						{t('community.readTimeShort', { count: readMinutes })}
					</span>
				</div>

				<h3 className="fixora-community__feed-card__title">{article.articleTitle}</h3>
				{article.articleExcerpt && (
					<p className="fixora-community__feed-card__excerpt">{article.articleExcerpt}</p>
				)}

				<div className="fixora-community__feed-card__footer">
					<div className="fixora-community__feed-card__author-row">
						<ArticleAuthorLink
							authorId={author?._id}
							name={authorName}
							avatarUrl={author?.userProfileImage}
							showVerified
						/>
						{publishedAt && (
							<span className="fixora-community__feed-card__date">{publishedAt}</span>
						)}
					</div>

					<div className="fixora-community__feed-card__actions">
						<button
							type="button"
							className={`fixora-community__action ${isLiked ? 'fixora-community__action--active' : ''}`}
							onClick={handleLike}
							disabled={likePending}
							aria-label={t('community.like')}
						>
							{isLiked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
							<span>{formatArticleCount(article.articleLikes ?? 0)}</span>
						</button>
						<div className="fixora-community__action fixora-community__action--static">
							<VisibilityRoundedIcon />
							<span>{formatArticleCount(article.articleViews ?? 0)}</span>
						</div>
						<div className="fixora-community__action fixora-community__action--static">
							<ChatBubbleOutlineRoundedIcon />
							<span>{formatArticleCount(article.articleComments ?? 0)}</span>
						</div>
						<button
							type="button"
							className={`fixora-community__action fixora-community__action--save ${isSaved ? 'fixora-community__action--active' : ''}`}
							onClick={handleSave}
							aria-label={t('community.save')}
						>
							{isSaved ? <BookmarkRoundedIcon /> : <BookmarkBorderRoundedIcon />}
						</button>
					</div>
				</div>
			</div>
		</article>
	);
};

export default ArticleFeedCard;
