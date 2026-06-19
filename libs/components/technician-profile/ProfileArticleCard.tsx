import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import { Article } from '../../types/fixora/fixora';
import { resolveArticleImageUrl } from '../../utils/articleImage';
import { isArticleSaved, toggleSavedArticle } from '../../utils/savedArticles';

interface ProfileArticleCardProps {
	article: Article;
	onLike: (articleId: string) => void;
	likePending?: boolean;
}

const formatCount = (value: number): string =>
	value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${value}`;

const ProfileArticleCard = ({ article, onLike, likePending = false }: ProfileArticleCardProps) => {
	const { t } = useTranslation('common');
	const detailHref = `/community/${article._id}`;
	const coverUrl = resolveArticleImageUrl(article.articleImage);
	const [imgFailed, setImgFailed] = useState(false);
	const [saved, setSaved] = useState(() => isArticleSaved(article._id));
	const showCover = !!coverUrl && !imgFailed;
	const isLiked = article.meLiked?.[0]?.myFavorite ?? false;

	const handleLike = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			onLike(article._id);
		},
		[article._id, onLike],
	);

	const handleSave = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setSaved(toggleSavedArticle(article._id));
		},
		[article._id],
	);

	return (
		<Link href={detailHref} className="fixora-tip-card fixora-tip-card--linkable fixora-tip-card--interactive">
			<div className="fixora-tip-card__body">
				<div className="fixora-tip-card__thumb">
					{showCover ? (
						<img
							className="fixora-tip-card__thumb-img"
							src={coverUrl}
							alt=""
							onError={() => setImgFailed(true)}
						/>
					) : (
						<div className="fixora-tip-card__thumb-empty" aria-hidden="true">
							<ImageOutlined style={{ fontSize: 28, color: '#3A3A3A' }} />
						</div>
					)}
				</div>
				<div className="fixora-tip-card__text">
					<strong className="fixora-tip-card__title">{article.articleTitle}</strong>
					{article.articleExcerpt && <p className="fixora-tip-card__excerpt">{article.articleExcerpt}</p>}
				</div>
			</div>

			<div className="fixora-tip-card__footer">
				<button
					type="button"
					className={`fixora-tip-card__stat fixora-tip-card__stat--btn fixora-tip-card__stat--likes ${
						isLiked ? 'fixora-tip-card__stat--likes--active' : ''
					}`}
					onClick={handleLike}
					disabled={likePending}
					aria-pressed={isLiked}
					aria-label={t('technicianProfile.articles.like')}
				>
					{isLiked ? <FavoriteIcon fontSize="inherit" /> : <FavoriteBorderIcon fontSize="inherit" />}
					{formatCount(article.articleLikes)}
				</button>
				<span className="fixora-tip-card__stat">
					<RemoveRedEyeOutlinedIcon fontSize="inherit" />
					{formatCount(article.articleViews)}
				</span>
				<span className="fixora-tip-card__stat">
					<ChatBubbleOutlineIcon fontSize="inherit" />
					{formatCount(article.articleComments)}
				</span>
				<button
					type="button"
					className={`fixora-tip-card__stat fixora-tip-card__stat--btn fixora-tip-card__stat--save ${
						saved ? 'fixora-tip-card__stat--save--active' : ''
					}`}
					onClick={handleSave}
					aria-pressed={saved}
					aria-label={t('technicianProfile.articles.save')}
				>
					{saved ? <BookmarkIcon fontSize="inherit" /> : <BookmarkBorderIcon fontSize="inherit" />}
				</button>
				<span className="fixora-tip-card__read-more">{t('homepage.tips.readMore')}</span>
			</div>
		</Link>
	);
};

export default ProfileArticleCard;
