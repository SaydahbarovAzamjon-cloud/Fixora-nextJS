import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useMutation } from '@apollo/client';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import { SAVE_ARTICLE, UNSAVE_ARTICLE } from '../../../apollo/user/article';
import { Article } from '../../types/fixora/fixora';
import { resolveArticleImageUrl } from '../../utils/articleImage';
import { sweetErrorHandling } from '../../sweetAlert';

interface ProfileArticleCardProps {
	article: Article;
	onLike: (articleId: string) => void;
	likePending?: boolean;
	userId?: string;
}

const formatCount = (value: number): string =>
	value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${value}`;

const ProfileArticleCard = ({ article, onLike, likePending = false, userId }: ProfileArticleCardProps) => {
	const { t } = useTranslation('common');
	const detailHref = `/community/${article._id}`;
	const coverUrl = resolveArticleImageUrl(article.articleImage);
	const [imgFailed, setImgFailed] = useState(false);
	const [saved, setSaved] = useState(() => article.meSaved?.[0]?.mySaved ?? false);
	const [savePending, setSavePending] = useState(false);
	const showCover = !!coverUrl && !imgFailed;
	const isLiked = article.meLiked?.[0]?.myFavorite ?? false;

	const [saveArticle] = useMutation(SAVE_ARTICLE);
	const [unsaveArticle] = useMutation(UNSAVE_ARTICLE);

	useEffect(() => {
		setSaved(article.meSaved?.[0]?.mySaved ?? false);
	}, [article.meSaved]);

	const handleLike = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			onLike(article._id);
		},
		[article._id, onLike],
	);

	const handleSave = useCallback(
		async (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (!userId) {
				await sweetErrorHandling(new Error(t('community.loginToSave')));
				return;
			}
			setSavePending(true);
			try {
				const result = saved
					? await unsaveArticle({ variables: { articleId: article._id } })
					: await saveArticle({ variables: { articleId: article._id } });
				const updated = result.data?.saveArticle ?? result.data?.unsaveArticle;
				setSaved(updated?.meSaved?.[0]?.mySaved ?? !saved);
			} catch (err) {
				await sweetErrorHandling(err);
			} finally {
				setSavePending(false);
			}
		},
		[article._id, saveArticle, saved, unsaveArticle, userId, t],
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
					disabled={savePending}
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
