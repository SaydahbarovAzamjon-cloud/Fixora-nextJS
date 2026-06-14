import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { ArticleSummary } from '../../types/fixora/fixora';

interface TechTipCardProps {
	article: ArticleSummary;
}

const formatCount = (value: number): string =>
	value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${value}`;

const TechTipCard = ({ article }: TechTipCardProps) => {
	const { t } = useTranslation('common');
	const detailHref = `/community/${article._id}`;
	const author = article.authorData;

	return (
		<div className="fixora-tip-card">
			<div className="fixora-tip-card__body">
				<div
					className="fixora-tip-card__thumb"
					style={{ backgroundImage: `url(${article.articleImage || '/img/community/communityImg.png'})` }}
				/>
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
				<Link href={detailHref} className="fixora-tip-card__read-more">
					{t('homepage.tips.readMore')}
				</Link>
			</div>
		</div>
	);
};

export default TechTipCard;
