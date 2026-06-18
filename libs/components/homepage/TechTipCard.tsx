import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import { ArticleSummary } from '../../types/fixora/fixora';
import { resolveArticleImageUrl } from '../../utils/articleImage';

interface TechTipCardProps {
	article: ArticleSummary;
	/** When true, entire card navigates to article (public profile). */
	linkable?: boolean;
}

const formatCount = (value: number): string =>
	value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${value}`;

const TechTipCard = ({ article, linkable = false }: TechTipCardProps) => {
	const { t } = useTranslation('common');
	const detailHref = `/community/${article._id}`;
	const author = article.authorData;
	const coverUrl = resolveArticleImageUrl(article.articleImage);
	const [imgFailed, setImgFailed] = useState(false);
	const showCover = !!coverUrl && !imgFailed;

	const footer = (
		<div className="fixora-tip-card__footer">
			<span className="fixora-tip-card__stat fixora-tip-card__stat--likes">
				<FavoriteBorderIcon fontSize="inherit" />
				{formatCount(article.articleLikes)}
			</span>
			<span className="fixora-tip-card__stat">
				<RemoveRedEyeOutlinedIcon fontSize="inherit" />
				{formatCount(article.articleViews)}
			</span>
			<span className="fixora-tip-card__stat">
				<ChatBubbleOutlineIcon fontSize="inherit" />
				{formatCount(article.articleComments)}
			</span>
			{linkable ? (
				<span className="fixora-tip-card__read-more">{t('homepage.tips.readMore')}</span>
			) : (
				<Link href={detailHref} className="fixora-tip-card__read-more">
					{t('homepage.tips.readMore')}
				</Link>
			)}
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
					<img src={author.userProfileImage || '/img/profile/defaultUser.svg'} alt="" />
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
			<Link href={detailHref} className="fixora-tip-card fixora-tip-card--linkable">
				{body}
			</Link>
		);
	}

	return <div className="fixora-tip-card">{body}</div>;
};

export default TechTipCard;
