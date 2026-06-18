import React from 'react';
import { useTranslation } from 'next-i18next';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import SwapHorizOutlined from '@mui/icons-material/SwapHorizOutlined';
import WriteArticleCard from './WriteArticleCard';
import { CoverFileState, formatFileSize } from '../../../hooks/useArticleCoverUpload';

interface CoverImageUploadProps {
	cover: CoverFileState | null;
	dragging: boolean;
	fileRef: React.RefObject<HTMLInputElement>;
	onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onDrop: (e: React.DragEvent) => void;
	onDragOver: (e: React.DragEvent) => void;
	onDragLeave: () => void;
	onRemove: () => void;
	onReplace: () => void;
	onOpenPicker: () => void;
}

const CoverImageUpload: React.FC<CoverImageUploadProps> = ({
	cover,
	dragging,
	fileRef,
	onPick,
	onDrop,
	onDragOver,
	onDragLeave,
	onRemove,
	onReplace,
	onOpenPicker,
}) => {
	const { t } = useTranslation('technician');

	return (
		<WriteArticleCard>
			<label className="ftwa-label">{t('writeArticle.coverLabel')}</label>
			{cover ? (
				<div className="ftwa-cover-preview">
					<img src={cover.previewUrl} alt="" className="ftwa-cover-preview__img" />
					<div className="ftwa-cover-preview__meta">
						<div className="ftwa-cover-preview__name">{cover.file.name}</div>
						<div className="ftwa-cover-preview__details">
							{formatFileSize(cover.file.size)} · {cover.file.type || t('writeArticle.unknownType')}
						</div>
					</div>
					<div className="ftwa-cover-preview__actions">
						<button type="button" className="ftwa-cover-preview__btn" onClick={onReplace}>
							<SwapHorizOutlined style={{ fontSize: 14 }} />
							{t('writeArticle.replaceImage')}
						</button>
						<button type="button" className="ftwa-cover-preview__btn ftwa-cover-preview__btn--danger" onClick={onRemove}>
							<CloseOutlined style={{ fontSize: 14 }} />
							{t('writeArticle.removeImage')}
						</button>
					</div>
				</div>
			) : (
				<div
					className={`ftwa-cover-drop ${dragging ? 'ftwa-cover-drop--active' : ''}`}
					onDragOver={onDragOver}
					onDragLeave={onDragLeave}
					onDrop={onDrop}
					onClick={onOpenPicker}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') onOpenPicker();
					}}
				>
					<div className="ftwa-cover-drop__icon">
						<CloudUploadOutlined style={{ fontSize: 20, color: '#FF6B00' }} />
					</div>
					<div className="ftwa-cover-drop__title">{t('writeArticle.coverDropTitle')}</div>
					<div className="ftwa-cover-drop__hint">{t('writeArticle.coverDropHint')}</div>
				</div>
			)}
			<input
				ref={fileRef}
				type="file"
				accept="image/png,image/jpeg,image/jpg,image/webp"
				className="ftwa-hidden-input"
				onChange={onPick}
			/>
		</WriteArticleCard>
	);
};

export default CoverImageUpload;
