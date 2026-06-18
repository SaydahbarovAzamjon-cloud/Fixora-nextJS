import React from 'react';
import { useTranslation } from 'next-i18next';
import TechTipCard from '../homepage/TechTipCard';
import { ArticleSummary } from '../../types/fixora/fixora';

interface TechnicianProfileArticlesProps {
	articles: ArticleSummary[];
}

const TechnicianProfileArticles = ({ articles }: TechnicianProfileArticlesProps) => {
	const { t } = useTranslation('common');

	if (!articles.length) {
		return <p className="fixora-tech-profile__empty">{t('technicianProfile.articles.empty')}</p>;
	}

	return (
		<div className="fixora-tech-profile__articles">
			<div className="fixora-home-tips__grid">
				{articles.map((article) => (
					<TechTipCard key={article._id} article={article} linkable />
				))}
			</div>
		</div>
	);
};

export default TechnicianProfileArticles;
