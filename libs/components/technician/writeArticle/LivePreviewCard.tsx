import React from 'react';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import WriteArticleCard, { WriteArticleCardHead } from './WriteArticleCard';
import { RepairCategoryId } from '../../../utils/articleCategoryMap';
import { userVar } from '../../../../apollo/store';

interface LivePreviewCardProps {
	title: string;
	excerpt: string;
	categoryId: RepairCategoryId;
	coverPreviewUrl: string | null;
	readMinutes: number;
}

const LivePreviewCard: React.FC<LivePreviewCardProps> = ({
	title,
	excerpt,
	categoryId,
	coverPreviewUrl,
	readMinutes,
}) => {
	const { t } = useTranslation('technician');
	const user = useReactiveVar(userVar);

	const displayName = user?.memberFullName || user?.memberNick || t('nav.fallbackName');
	const initials = displayName
		.split(' ')
		.map((p) => p.charAt(0))
		.slice(0, 2)
		.join('')
		.toUpperCase();

	const previewTitle = title || t('writeArticle.previewTitleFallback');
	const previewExcerpt = excerpt || t('writeArticle.previewExcerptFallback');

	return (
		<WriteArticleCard padding={false}>
			<WriteArticleCardHead
				title={t('writeArticle.livePreview')}
				icon={<VisibilityOutlined style={{ fontSize: 14, color: '#FF6B00' }} />}
			/>
			<div className="ftwa-preview">
				<div className={`ftwa-preview__cover ${coverPreviewUrl ? 'ftwa-preview__cover--has-img' : ''}`}>
					{coverPreviewUrl ? (
						<img src={coverPreviewUrl} alt="" />
					) : (
						<ImageOutlined style={{ fontSize: 28, color: '#2A2A2A' }} />
					)}
				</div>

				<span className="ftwa-preview__badge">{t(`writeArticle.categories.${categoryId}`)}</span>

				<h3 className="ftwa-preview__title">{previewTitle}</h3>
				<p className="ftwa-preview__excerpt">{previewExcerpt}</p>

				<div className="ftwa-preview__author">
					<div className="ftwa-preview__avatar">{initials || 'T'}</div>
					<div className="ftwa-preview__author-info">
						<div className="ftwa-preview__author-name">{displayName}</div>
						<div className="ftwa-preview__author-role">{t('nav.proTechnician')}</div>
					</div>
					<div className="ftwa-preview__read">
						<AccessTimeOutlined style={{ fontSize: 10 }} />
						{t('writeArticle.readTimeShort', { count: readMinutes })}
					</div>
				</div>
			</div>
		</WriteArticleCard>
	);
};

export default LivePreviewCard;
