import React from 'react';
import { useTranslation } from 'next-i18next';
import CheckOutlined from '@mui/icons-material/CheckOutlined';
import WriteArticleCard from './WriteArticleCard';
import { REPAIR_CATEGORY_IDS, RepairCategoryId } from '../../../utils/articleCategoryMap';

interface CategoryPillsProps {
	selected: RepairCategoryId;
	onChange: (id: RepairCategoryId) => void;
}

const CategoryPills: React.FC<CategoryPillsProps> = ({ selected, onChange }) => {
	const { t } = useTranslation('technician');

	return (
		<WriteArticleCard>
			<label className="ftwa-label">{t('writeArticle.categoriesLabel')}</label>
			<div className="ftwa-pills">
				{REPAIR_CATEGORY_IDS.map((id) => {
					const active = selected === id;
					return (
						<button
							key={id}
							type="button"
							className={`ftwa-pill ${active ? 'ftwa-pill--active' : ''}`}
							onClick={() => onChange(id)}
						>
							{active && <CheckOutlined style={{ fontSize: 12, marginRight: 4 }} />}
							{t(`writeArticle.categories.${id}`)}
						</button>
					);
				})}
			</div>
		</WriteArticleCard>
	);
};

export default CategoryPills;
