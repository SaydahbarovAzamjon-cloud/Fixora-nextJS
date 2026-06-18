import React from 'react';
import { useTranslation } from 'next-i18next';
import TagOutlined from '@mui/icons-material/TagOutlined';
import WriteArticleCard, { WriteArticleCardHead } from './WriteArticleCard';
import { FieldErrors } from '../../../hooks/useWriteArticleForm';

interface SeoSettingsPanelProps {
	metaTitle: string;
	metaDescription: string;
	keywords: string;
	onMetaTitle: (v: string) => void;
	onMetaDescription: (v: string) => void;
	onKeywords: (v: string) => void;
	limits: { metaTitleMax: number; metaDescMax: number; keywordsMax: number };
	errors: FieldErrors;
}

const SeoSettingsPanel: React.FC<SeoSettingsPanelProps> = ({
	metaTitle,
	metaDescription,
	keywords,
	onMetaTitle,
	onMetaDescription,
	onKeywords,
	limits,
	errors,
}) => {
	const { t } = useTranslation('technician');

	return (
		<WriteArticleCard padding={false}>
			<WriteArticleCardHead
				title={t('writeArticle.seoSettings')}
				icon={<TagOutlined style={{ fontSize: 14, color: '#3B82F6' }} />}
				iconClass="ftwa-card-head__icon--blue"
			/>
			<div className="ftwa-seo">
				<div className="ftwa-seo__field">
					<label className="ftwa-seo__label">{t('writeArticle.metaTitle')}</label>
					<input
						className={`ftwa-input ftwa-input--sm ${errors.metaTitle ? 'ftwa-input--error' : ''}`}
						value={metaTitle}
						onChange={(e) => onMetaTitle(e.target.value)}
						placeholder={t('writeArticle.metaTitlePlaceholder')}
						maxLength={limits.metaTitleMax + 10}
					/>
					{errors.metaTitle && (
						<span className="ftwa-field-error">{t(`writeArticle.errors.${errors.metaTitle}`)}</span>
					)}
				</div>
				<div className="ftwa-seo__field">
					<label className="ftwa-seo__label">{t('writeArticle.metaDescription')}</label>
					<textarea
						className={`ftwa-textarea ftwa-textarea--sm ${errors.metaDescription ? 'ftwa-input--error' : ''}`}
						value={metaDescription}
						onChange={(e) => onMetaDescription(e.target.value)}
						placeholder={t('writeArticle.metaDescriptionPlaceholder')}
						rows={2}
						maxLength={limits.metaDescMax + 10}
					/>
					{errors.metaDescription && (
						<span className="ftwa-field-error">{t(`writeArticle.errors.${errors.metaDescription}`)}</span>
					)}
				</div>
				<div className="ftwa-seo__field">
					<label className="ftwa-seo__label">{t('writeArticle.keywords')}</label>
					<input
						className={`ftwa-input ftwa-input--sm ${errors.keywords ? 'ftwa-input--error' : ''}`}
						value={keywords}
						onChange={(e) => onKeywords(e.target.value)}
						placeholder={t('writeArticle.keywordsPlaceholder')}
						maxLength={limits.keywordsMax + 10}
					/>
					{errors.keywords && (
						<span className="ftwa-field-error">{t(`writeArticle.errors.${errors.keywords}`)}</span>
					)}
				</div>
			</div>
		</WriteArticleCard>
	);
};

export default SeoSettingsPanel;
