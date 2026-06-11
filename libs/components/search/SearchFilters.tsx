import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Radio, Checkbox, RadioGroup } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { TechniciansInquiry } from '../../types/fixora/fixora';

interface SearchFiltersProps {
	searchFilter: TechniciansInquiry;
	setSearchFilter: (input: TechniciansInquiry) => void;
}

const LOCATIONS = ['all', 'busan', 'seoul', 'incheon', 'daegu'] as const;
const LOCATION_LABEL: Record<(typeof LOCATIONS)[number], string> = {
	all: '',
	busan: 'Busan',
	seoul: 'Seoul',
	incheon: 'Incheon',
	daegu: 'Daegu',
};

const SERVICES = ['screenRepair', 'batteryIssue', 'waterDamage', 'iphoneRepair', 'macbookRepair'] as const;
const SERVICE_ISSUE_CATEGORY: Partial<Record<(typeof SERVICES)[number], string>> = {
	screenRepair: 'SCREEN',
	batteryIssue: 'BATTERY',
	waterDamage: 'WATER_DAMAGE',
};
const SERVICE_DEVICE_CATEGORY: Partial<Record<(typeof SERVICES)[number], string>> = {
	iphoneRepair: 'IPHONE',
	macbookRepair: 'MACBOOK',
};

const RATINGS = [4, 4.5, 4.0, 3.5, 3.0] as const;

interface FilterDraft {
	location: (typeof LOCATIONS)[number];
	service: (typeof SERVICES)[number] | null;
	rating: number | null;
}

const EMPTY_DRAFT: FilterDraft = { location: 'all', service: null, rating: null };

const SearchFilters = ({ searchFilter, setSearchFilter }: SearchFiltersProps) => {
	const { t } = useTranslation('common');
	const [draft, setDraft] = useState<FilterDraft>(EMPTY_DRAFT);

	const clearAllHandler = () => {
		setDraft(EMPTY_DRAFT);
		setSearchFilter({ ...searchFilter, page: 1, search: {} });
	};

	const applyHandler = () => {
		const search: TechniciansInquiry['search'] = {};

		if (draft.location !== 'all') {
			search.userLocation = LOCATION_LABEL[draft.location];
		}
		if (draft.service) {
			const deviceCategory = SERVICE_DEVICE_CATEGORY[draft.service];
			const issueCategory = SERVICE_ISSUE_CATEGORY[draft.service];
			if (deviceCategory) search.deviceCategory = deviceCategory;
			if (issueCategory) search.issueCategory = issueCategory;
		}
		if (draft.rating) {
			search.minAverageRating = draft.rating;
		}

		setSearchFilter({ ...searchFilter, page: 1, search });
	};

	return (
		<aside className="fixora-search-filters">
			<div className="fixora-search-filters__header">
				<strong>{t('search.filters.title')}</strong>
				<button type="button" className="fixora-search-filters__clear" onClick={clearAllHandler}>
					{t('search.filters.clearAll')}
				</button>
			</div>

			<div className="fixora-search-filters__group">
				<p className="fixora-search-filters__group-title">{t('search.filters.location.title')}</p>
				<RadioGroup
					value={draft.location}
					onChange={(_, value) => setDraft({ ...draft, location: value as (typeof LOCATIONS)[number] })}
				>
					{LOCATIONS.map((location) => (
						<label key={location} className="fixora-search-filters__option">
							<Radio value={location} size="small" />
							{t(`search.filters.location.${location}`)}
						</label>
					))}
				</RadioGroup>
			</div>

			<div className="fixora-search-filters__group">
				<p className="fixora-search-filters__group-title">{t('search.filters.service.title')}</p>
				{SERVICES.map((service) => (
					<label key={service} className="fixora-search-filters__option">
						<Checkbox
							size="small"
							checked={draft.service === service}
							onChange={(_, checked) => setDraft({ ...draft, service: checked ? service : null })}
						/>
						{t(`search.filters.service.${service}`)}
					</label>
				))}
			</div>

			<div className="fixora-search-filters__group">
				<p className="fixora-search-filters__group-title">{t('search.filters.rating.title')}</p>
				<RadioGroup
					value={draft.rating ?? ''}
					onChange={(_, value) => setDraft({ ...draft, rating: value ? Number(value) : null })}
				>
					{RATINGS.map((rating) => (
						<label key={rating} className="fixora-search-filters__option">
							<Radio value={rating} size="small" />
							<StarIcon fontSize="inherit" />
							{t(`search.filters.rating.${rating === 4 ? '4andUp' : `${rating.toFixed(1).replace('.', '_')}andUp`}`)}
						</label>
					))}
				</RadioGroup>
			</div>

			<button type="button" className="fixora-search-filters__apply" onClick={applyHandler}>
				{t('search.filters.apply')}
			</button>
		</aside>
	);
};

export default SearchFilters;
