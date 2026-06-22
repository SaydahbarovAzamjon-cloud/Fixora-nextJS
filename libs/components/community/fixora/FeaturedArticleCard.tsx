import React, { useCallback, useState } from 'react';
import { useTranslation } from 'next-i18next';
import LocalFireDepartmentOutlined from '@mui/icons-material/LocalFireDepartmentOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import { Article } from '../../../types/fixora/fixora';
import { resolveArticleImageUrl } from '../../../utils/articleImage';
import { estimateArticleReadMinutes } from '../../../utils/articleReadTime';
import { formatArticleCount, formatArticlePublishedAt, getArticleTagKeys } from '../../../utils/communityArticleDisplay';
import ArticleAuthorLink from './ArticleAuthorLink';

interface FeaturedArticleCardProps {
	article: Article;
	onOpen: (articleId: string) => void;
	onLike: (articleId: string) => void;
	onToggleSave: (articleId: string) => void;
	isSaved: boolean;
	likePending?: boolean;
}

const FeaturedArticleCard: React.FC<FeaturedArticleCardProps> = ({
	article,
	onOpen,
	onLike,
	onToggleSave,
	isSaved,
	likePending = false,
}) => {
	const { t, i18n } = useTranslation('common');
	const coverUrl = resolveArticleImageUrl(article.articleImage);
	const [imgFailed, setImgFailed] = useState(false);
	const showCover = !!coverUrl && !imgFailed;
	const isLiked = article.meLiked?.[0]?.myFavorite ?? false;
	const readMinutes = estimateArticleReadMinutes(article);
	const tagKeys = getArticleTagKeys(article);

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
			className="fixora-community__featured"
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
			<div className="fixora-community__featured__media">
				{showCover ? (
					<img
						src={coverUrl}
						alt=""
						loading="lazy"
						onError={() => setImgFailed(true)}
					/>
				) : (
					<div className="fixora-community__featured__media-empty" aria-hidden="true">
						<ImageOutlined style={{ fontSize: 48, color: '#3A3A3A' }} />
					</div>
				)}
				<div className="fixora-community__featured__overlay" />
			</div>

			<div className="fixora-community__featured__content">
				<div className="fixora-community__featured__top">
					<span className="fixora-community__featured-badge">
						<LocalFireDepartmentOutlined style={{ fontSize: 14 }} />
						{t('community.featuredBadge')}
					</span>
					<span className="fixora-community__read-time">
						{t('community.readTimeShort', { count: readMinutes })}
					</span>
				</div>

				<div className="fixora-community__featured__author-row">
					<ArticleAuthorLink
						authorId={author?._id}
						name={authorName}
						avatarUrl={author?.userProfileImage}
						showVerified
						className="fixora-community__author-link fixora-community__author-link--featured"
					/>
					{publishedAt && (
						<span className="fixora-community__featured__date">{publishedAt}</span>
					)}
				</div>

				<h2 className="fixora-community__featured__title">{article.articleTitle}</h2>
				{article.articleExcerpt && (
					<p className="fixora-community__featured__excerpt">{article.articleExcerpt}</p>
				)}

				<div className="fixora-community__featured__bottom">
					<div className="fixora-community__featured__stats">
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
					</div>

					<div className="fixora-community__featured__tags">
						{tagKeys.map((key) => (
							<span key={key} className="fixora-community__tag">
								{key.startsWith('community.') ? t(key) : key}
							</span>
						))}
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
		</article>
	);
};

export default FeaturedArticleCard;
