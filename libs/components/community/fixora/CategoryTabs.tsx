import React from 'react';
import { useTranslation } from 'next-i18next';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import StarOutlineOutlined from '@mui/icons-material/StarOutlineOutlined';
import {
	COMMUNITY_CATEGORY_IDS,
	CommunityCategoryId,
} from '../../../utils/communityCategories';

interface CategoryTabsProps {
	value: CommunityCategoryId;
	onChange: (category: CommunityCategoryId) => void;
}

const CATEGORY_ICONS: Record<CommunityCategoryId, React.ReactNode> = {
	all: <AutoAwesomeOutlined style={{ fontSize: 16 }} />,
	repair_guides: <MenuBookOutlined style={{ fontSize: 16 }} />,
	quick_tips: <BuildOutlined style={{ fontSize: 16 }} />,
	troubleshooting: <InfoOutlined style={{ fontSize: 16 }} />,
	success_stories: <EmojiEventsOutlined style={{ fontSize: 16 }} />,
	expert_articles: <StarOutlineOutlined style={{ fontSize: 16 }} />,
};

const CategoryTabs: React.FC<CategoryTabsProps> = ({ value, onChange }) => {
	const { t } = useTranslation('common');

	return (
		<div className="fixora-community__tabs" role="tablist" aria-label={t('community.categoriesLabel')}>
			{COMMUNITY_CATEGORY_IDS.map((cat) => (
				<button
					key={cat}
					type="button"
					role="tab"
					aria-selected={value === cat}
					className={`fixora-community__tab ${value === cat ? 'fixora-community__tab--active' : ''}`}
					onClick={() => onChange(cat)}
				>
					{CATEGORY_ICONS[cat]}
					{t(`community.categories.${cat}`)}
				</button>
			))}
		</div>
	);
};

export default CategoryTabs;
