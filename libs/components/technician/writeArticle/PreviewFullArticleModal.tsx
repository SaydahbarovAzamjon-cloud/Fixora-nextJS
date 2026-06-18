import React from 'react';
import { useTranslation } from 'next-i18next';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import { RepairCategoryId } from '../../../utils/articleCategoryMap';

interface PreviewFullArticleModalProps {
	open: boolean;
	onClose: () => void;
	title: string;
	excerpt: string;
	content: string;
	categoryId: RepairCategoryId;
	coverPreviewUrl: string | null;
	readMinutes: number;
	authorName: string;
	authorRole: string;
	authorInitials: string;
}

const PreviewFullArticleModal: React.FC<PreviewFullArticleModalProps> = ({
	open,
	onClose,
	title,
	excerpt,
	content,
	categoryId,
	coverPreviewUrl,
	readMinutes,
	authorName,
	authorRole,
	authorInitials,
}) => {
	const { t } = useTranslation('technician');

	if (!open) return null;

	const displayTitle = title || t('writeArticle.previewTitleFallback');

	return (
		<div className="ftwa-modal-overlay" onClick={onClose} role="presentation">
			<div className="ftwa-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
				<div className="ftwa-modal__header">
					<h2>{t('writeArticle.previewFull')}</h2>
					<button type="button" className="ftwa-modal__close" onClick={onClose} aria-label={t('writeArticle.closePreview')}>
						<CloseOutlined style={{ fontSize: 18 }} />
					</button>
				</div>
				<div className="ftwa-modal__body">
					{coverPreviewUrl && (
						<div className="ftwa-modal__cover">
							<img src={coverPreviewUrl} alt="" />
						</div>
					)}
					<span className="ftwa-preview__badge">{t(`writeArticle.categories.${categoryId}`)}</span>
					<h1 className="ftwa-modal__title">{displayTitle}</h1>
					{excerpt && <p className="ftwa-modal__excerpt">{excerpt}</p>}
					<pre className="ftwa-modal__content">{content}</pre>
					<div className="ftwa-preview__author">
						<div className="ftwa-preview__avatar">{authorInitials}</div>
						<div className="ftwa-preview__author-info">
							<div className="ftwa-preview__author-name">{authorName}</div>
							<div className="ftwa-preview__author-role">{authorRole}</div>
						</div>
						<div className="ftwa-preview__read">{t('writeArticle.readTimeShort', { count: readMinutes })}</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PreviewFullArticleModal;
