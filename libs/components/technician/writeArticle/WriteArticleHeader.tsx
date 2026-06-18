import React from 'react';
import { useTranslation } from 'next-i18next';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';

interface WriteArticleHeaderProps {
	isEdit?: boolean;
}

const WriteArticleHeader: React.FC<WriteArticleHeaderProps> = ({ isEdit = false }) => {
	const { t } = useTranslation('technician');

	return (
		<div className="ftwa-header">
			<div className="ftwa-header__row">
				<div className="ftwa-header__icon-wrap">
					<DescriptionOutlined style={{ fontSize: 15, color: '#fff' }} />
				</div>
				<h1 className="ftwa-header__title">
					{isEdit ? t('writeArticle.editPageTitle') : t('writeArticle.pageTitle')}
				</h1>
				<span className="ftwa-header__badge">
					{isEdit ? t('writeArticle.editBadge') : t('writeArticle.draftBadge')}
				</span>
			</div>
			<p className="ftwa-header__subtitle">
				{isEdit ? t('writeArticle.editPageSubtitle') : t('writeArticle.pageSubtitle')}
			</p>
		</div>
	);
};

export default WriteArticleHeader;
