import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import StarRounded from '@mui/icons-material/StarRounded';
import { Article } from '../../../types/fixora/fixora';
import { resolveArticleImageUrl } from '../../../utils/articleImage';
import { getArticleLocalSettings } from '../../../utils/articleLocalSettings';

interface MyArticleCardProps {
	article: Article;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	onViewComments: (article: Article) => void;
	deleting?: boolean;
}

const formatCount = (value: number): string =>
	value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${value}`;

const MyArticleCard: React.FC<MyArticleCardProps> = ({
	article,
	onEdit,
	onDelete,
	onViewComments,
	deleting = false,
}) => {
	const { t } = useTranslation('technician');
	const [imgFailed, setImgFailed] = useState(false);
	const coverUrl = resolveArticleImageUrl(article.articleImage);
	const showCover = !!coverUrl && !imgFailed;
	const localSettings = getArticleLocalSettings(article._id);
	const isDraft = article.articleStatus === 'DRAFT';
	const isPublished = article.articleStatus === 'PUBLISHED';
	const commentsDisabled = localSettings?.allowComments === false;

	return (
		<article className={`ftma-card fixora-tip-card ${deleting ? 'ftma-card--deleting' : ''}`}>
			<div className="ftma-card__top">
				{localSettings?.featured && (
					<span className="ftma-card__badge ftma-card__badge--featured">
						<StarRounded style={{ fontSize: 10 }} />
						{t('myArticles.status.featured')}
					</span>
				)}
				{isDraft && (
					<span className="ftma-card__badge ftma-card__badge--draft">{t('myArticles.status.draft')}</span>
				)}
				{isPublished && (
					<span className="ftma-card__badge ftma-card__badge--published">{t('myArticles.status.published')}</span>
				)}
			</div>

			<div className="fixora-tip-card__body">
				<div className="fixora-tip-card__thumb ftma-card__thumb">
					{showCover ? (
						<img
							src={coverUrl}
							alt=""
							className="ftma-card__thumb-img"
							onError={() => setImgFailed(true)}
						/>
					) : (
						<div className="ftma-card__thumb-empty" aria-hidden="true">
							<ImageOutlined style={{ fontSize: 28, color: '#3A3A3A' }} />
						</div>
					)}
				</div>
				<div className="fixora-tip-card__text">
					<strong className="fixora-tip-card__title">{article.articleTitle}</strong>
					{article.articleExcerpt && (
						<p className="fixora-tip-card__excerpt">{article.articleExcerpt}</p>
					)}
				</div>
			</div>

			<div className="fixora-tip-card__footer ftma-card__footer">
				<span className="fixora-tip-card__stat fixora-tip-card__stat--likes">
					<FavoriteBorderIcon fontSize="inherit" />
					{formatCount(article.articleLikes ?? 0)}
				</span>
				<span className="fixora-tip-card__stat">
					<RemoveRedEyeOutlinedIcon fontSize="inherit" />
					{formatCount(article.articleViews ?? 0)}
				</span>
				<button
					type="button"
					className={`ftma-card__stat-btn ${commentsDisabled ? 'ftma-card__stat-btn--disabled' : ''}`}
					onClick={() => onViewComments(article)}
					title={
						commentsDisabled
							? t('myArticles.commentsDisabled')
							: t('myArticles.actions.viewComments')
					}
					disabled={commentsDisabled}
				>
					<ChatBubbleOutlineIcon fontSize="inherit" />
					{formatCount(article.articleComments ?? 0)}
				</button>
			</div>

			<div className="ftma-card__actions">
				<button type="button" className="ftma-card__action" onClick={() => onEdit(article._id)} disabled={deleting}>
					<EditOutlined style={{ fontSize: 14 }} />
					{t('myArticles.actions.edit')}
				</button>
				<button
					type="button"
					className="ftma-card__action ftma-card__action--danger"
					onClick={() => onDelete(article._id)}
					disabled={deleting}
				>
					<DeleteOutlineOutlined style={{ fontSize: 14 }} />
					{deleting ? t('myArticles.actions.deleting') : t('myArticles.actions.delete')}
				</button>
				<a
					href={`/community/${article._id}`}
					className="ftma-card__action ftma-card__action--view"
					target="_blank"
					rel="noopener noreferrer"
				>
					<OpenInNewOutlined style={{ fontSize: 14 }} />
					{t('myArticles.actions.view')}
				</a>
			</div>
		</article>
	);
};

export default MyArticleCard;
