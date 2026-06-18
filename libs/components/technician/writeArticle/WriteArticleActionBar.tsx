import React from 'react';
import { useTranslation } from 'next-i18next';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import { formatTimeAgo } from '../../../utils/i18nTime';

interface WriteArticleActionBarProps {
	lastSavedAt: string | null;
	submitting: boolean;
	onPreview: () => void;
	onSaveDraft: () => void;
	onPublish: () => void;
	locale?: string;
	isEdit?: boolean;
}

const WriteArticleActionBar: React.FC<WriteArticleActionBarProps> = ({
	lastSavedAt,
	submitting,
	onPreview,
	onSaveDraft,
	onPublish,
	locale,
	isEdit = false,
}) => {
	const { t } = useTranslation('technician');

	const autosaveLabel = lastSavedAt
		? t('writeArticle.autoSaved', { time: formatTimeAgo(lastSavedAt, t, locale) })
		: t('writeArticle.autoSavePending');

	return (
		<div className="ftwa-action-bar">
			<div className="ftwa-action-bar__autosave">
				<span className="ftwa-action-bar__dot" />
				{autosaveLabel}
			</div>
			<div className="ftwa-action-bar__spacer" />
			<button type="button" className="ftwa-action-bar__btn ftwa-action-bar__btn--ghost" onClick={onPreview} disabled={submitting}>
				<VisibilityOutlined style={{ fontSize: 14 }} />
				{t('writeArticle.previewFull')}
			</button>
			<button type="button" className="ftwa-action-bar__btn ftwa-action-bar__btn--secondary" onClick={onSaveDraft} disabled={submitting}>
				<SaveOutlined style={{ fontSize: 14 }} />
				{submitting ? t('writeArticle.saving') : t('writeArticle.saveDraft')}
			</button>
			<button type="button" className="ftwa-action-bar__btn ftwa-action-bar__btn--primary" onClick={onPublish} disabled={submitting}>
				<SendOutlined style={{ fontSize: 14 }} />
				{submitting
					? isEdit
						? t('writeArticle.updating')
						: t('writeArticle.publishing')
					: isEdit
						? t('writeArticle.updateArticle')
						: t('writeArticle.publishArticle')}
			</button>
		</div>
	);
};

export default WriteArticleActionBar;
