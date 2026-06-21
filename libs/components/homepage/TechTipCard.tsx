import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import { ArticleSummary } from '../../types/fixora/fixora';
import { resolveArticleImageUrl } from '../../utils/articleImage';
import { resolveProfileImageUrl } from '../../utils/profileImage';

interface TechTipCardProps {
	article: ArticleSummary;
	/** When true, entire card navigates to article (public profile). */
	linkable?: boolean;
	onLike?: (articleId: string) => void;
	likePending?: boolean;
}

const formatCount = (value: number): string =>
	value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${value}`;

const DEFAULT_AVATAR = '/img/profile/defaultUser.svg';

const TechTipCard = ({ article, linkable = false, onLike, likePending = false }: TechTipCardProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const detailHref = `/community/${article._id}`;
	const author = article.authorData;
	const coverUrl = resolveArticleImageUrl(article.articleImage);
	const [imgFailed, setImgFailed] = useState(false);
	const showCover = !!coverUrl && !imgFailed;
	const isLiked = article.meLiked?.[0]?.myFavorite ?? false;

	const handleLike = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			onLike?.(article._id);
		},
		[article._id, onLike],
	);

	const footer = (
		<div className="fixora-tip-card__footer">
			<button
				type="button"
				className={[
					'fixora-tip-card__stat',
					'fixora-tip-card__stat--likes',
					'fixora-tip-card__stat--btn',
					isLiked ? 'fixora-tip-card__stat--likes--active' : '',
				]
					.filter(Boolean)
					.join(' ')}
				onClick={handleLike}
				disabled={likePending || !onLike}
				aria-label={t('community.like')}
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
			<Link
				href={detailHref}
				className="fixora-tip-card__read-more"
				onClick={(e) => e.stopPropagation()}
			>
				{t('homepage.tips.readMore')}
			</Link>
		</div>
	);

	const body = (
		<>
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

			{author && (
				<div className="fixora-tip-card__author">
					<img
						src={resolveProfileImageUrl(author.userProfileImage)}
						alt=""
						onError={(e) => {
							if (!e.currentTarget.src.endsWith('defaultUser.svg')) {
								e.currentTarget.src = DEFAULT_AVATAR;
							}
						}}
					/>
					<div>
						<span>{author.userNickname || author.userFullName}</span>
						{author.specialty && <small>{author.specialty}</small>}
					</div>
				</div>
			)}

			{footer}
		</>
	);

	if (linkable) {
		return (
			<div
				role="link"
				tabIndex={0}
				className="fixora-tip-card fixora-tip-card--linkable"
				onClick={() => router.push(detailHref)}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						router.push(detailHref);
					}
				}}
			>
				{body}
			</div>
		);
	}

	return <div className="fixora-tip-card">{body}</div>;
};

export default TechTipCard;
