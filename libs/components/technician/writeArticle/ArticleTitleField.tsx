import React from 'react';
import { useTranslation } from 'next-i18next';
import WriteArticleCard from './WriteArticleCard';
import { FieldErrors } from '../../../hooks/useWriteArticleForm';

interface ArticleTitleFieldProps {
	value: string;
	onChange: (value: string) => void;
	maxLength: number;
	error?: string;
}

const ArticleTitleField: React.FC<ArticleTitleFieldProps> = ({
	value,
	onChange,
	maxLength,
	error,
}) => {
	const { t } = useTranslation('technician');

	return (
		<WriteArticleCard>
			<label className="ftwa-label" htmlFor="ftwa-article-title">
				{t('writeArticle.titleLabel')}
			</label>
			<input
				id="ftwa-article-title"
				className={`ftwa-input ftwa-input--title ${error ? 'ftwa-input--error' : ''}`}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={t('writeArticle.titlePlaceholder')}
				maxLength={maxLength + 10}
			/>
			<div className="ftwa-counter-row">
				{error && <span className="ftwa-field-error">{t(`writeArticle.errors.${error}`)}</span>}
				<span className={`ftwa-counter ${value.length > maxLength - 20 ? 'ftwa-counter--warn' : ''}`}>
					{value.length}/{maxLength}
				</span>
			</div>
		</WriteArticleCard>
	);
};

export default ArticleTitleField;

interface ShortDescriptionFieldProps {
	value: string;
	onChange: (value: string) => void;
	maxLength: number;
	error?: string;
}

export const ShortDescriptionField: React.FC<ShortDescriptionFieldProps> = ({
	value,
	onChange,
	maxLength,
	error,
}) => {
	const { t } = useTranslation('technician');

	return (
		<WriteArticleCard>
			<label className="ftwa-label" htmlFor="ftwa-article-excerpt">
				{t('writeArticle.excerptLabel')}
			</label>
			<textarea
				id="ftwa-article-excerpt"
				className={`ftwa-textarea ${error ? 'ftwa-input--error' : ''}`}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={t('writeArticle.excerptPlaceholder')}
				rows={3}
				maxLength={maxLength + 10}
			/>
			<div className="ftwa-counter-row">
				{error && <span className="ftwa-field-error">{t(`writeArticle.errors.${error}`)}</span>}
				<span className={`ftwa-counter ${value.length > maxLength - 30 ? 'ftwa-counter--warn' : ''}`}>
					{value.length}/{maxLength}
				</span>
			</div>
		</WriteArticleCard>
	);
};

export type { FieldErrors };
