import React from 'react';
import { ArticleCategory } from '../../../types/fixora/fixora';

interface CategoryTabsProps {
	value: ArticleCategory;
	onChange: (category: ArticleCategory) => void;
}

const CategoryTabs = ({ value, onChange }: CategoryTabsProps) => {
	const categories: { label: string; value: ArticleCategory }[] = [
		{ label: 'Free', value: 'FREE' },
		{ label: 'Recommend', value: 'RECOMMEND' },
		{ label: 'News', value: 'NEWS' },
		{ label: 'Humor', value: 'HUMOR' },
	];

	return (
		<div className="fixora-community__tabs">
			{categories.map((cat) => (
				<button
					key={cat.value}
					className={`fixora-community__tab ${value === cat.value ? 'fixora-community__tab--active' : ''}`}
					onClick={() => onChange(cat.value)}
				>
					{cat.label}
				</button>
			))}
		</div>
	);
};

export default CategoryTabs;
