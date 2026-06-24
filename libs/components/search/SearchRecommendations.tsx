import React from 'react';
import { useTranslation } from 'next-i18next';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useSearchRecommendations } from '../../hooks/useSearchRecommendations';
import type { TechniciansInquiry } from '../../types/fixora/fixora';
import HeroRecommendedCarousel from '../homepage/HeroRecommendedCarousel';

interface SearchRecommendationsProps {
	searchFilter: TechniciansInquiry;
}

const SearchRecommendations: React.FC<SearchRecommendationsProps> = ({ searchFilter }) => {
	const { t } = useTranslation('common');
	const { recommendations, loading, visible } = useSearchRecommendations(searchFilter);

	if (!visible) return null;
	if (!loading && recommendations.length === 0) return null;

	return (
		<section className="fixora-search-recommendations" aria-live="polite">
			<div className="fixora-search-recommendations__head">
				<AutoAwesomeOutlinedIcon className="fixora-search-recommendations__icon" fontSize="small" />
				<div>
					<h2 className="fixora-search-recommendations__title">{t('search.recommendations.title')}</h2>
					<p className="fixora-search-recommendations__hint">{t('search.recommendations.hint')}</p>
				</div>
			</div>

			{loading && recommendations.length === 0 ? (
				<p className="fixora-search-recommendations__loading">{t('search.recommendations.loading')}</p>
			) : (
				<div className="fixora-search-recommendations__carousel">
					<HeroRecommendedCarousel recommendations={recommendations} />
				</div>
			)}
		</section>
	);
};

export default SearchRecommendations;
