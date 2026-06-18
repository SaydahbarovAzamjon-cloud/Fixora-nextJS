import React from 'react';
import { useTranslation } from 'next-i18next';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';

const WriteArticleHeader: React.FC = () => {
	const { t } = useTranslation('technician');

	return (
		<div className="ftwa-header">
			<div className="ftwa-header__row">
				<div className="ftwa-header__icon-wrap">
					<DescriptionOutlined style={{ fontSize: 15, color: '#fff' }} />
				</div>
				<h1 className="ftwa-header__title">{t('writeArticle.pageTitle')}</h1>
				<span className="ftwa-header__badge">{t('writeArticle.draftBadge')}</span>
			</div>
			<p className="ftwa-header__subtitle">{t('writeArticle.pageSubtitle')}</p>
		</div>
	);
};

export default WriteArticleHeader;
