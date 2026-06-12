import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Radio, Checkbox, RadioGroup } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { TechniciansInquiry } from '../../types/fixora/fixora';
import { DEFAULT_GEO_SEARCH_RADIUS_KM } from '../../kakao-maps';
import { SERVICES, SERVICE_ISSUE_CATEGORY, SERVICE_DEVICE_CATEGORY } from './categoryMappings';

interface SearchFiltersProps {
	searchFilter: TechniciansInquiry;
	setSearchFilter: (input: TechniciansInquiry) => void;
}

const DEVICES = ['all', 'iphone', 'macbook', 'ipad', 'appleWatch'] as const;
const DEVICE_CATEGORY: Partial<Record<(typeof DEVICES)[number], string>> = {
	iphone: 'IPHONE',
	macbook: 'MACBOOK',
	ipad: 'IPAD',
	appleWatch: 'APPLE_WATCH',
};

const RATINGS = [4.5, 4.0, 3.5, 3.0] as const;

const AVAILABILITY = ['anytime', 'availableNow'] as const;

type GroupKey = 'service' | 'device' | 'rating' | 'availability';

interface FilterDraft {
	service: (typeof SERVICES)[number] | null;
	device: (typeof DEVICES)[number];
	rating: number | null;
	availability: (typeof AVAILABILITY)[number];
}

const EMPTY_DRAFT: FilterDraft = { service: null, device: 'all', rating: null, availability: 'anytime' };

const SearchFilters = ({ searchFilter, setSearchFilter }: SearchFiltersProps) => {
	const { t } = useTranslation('common');
	const [draft, setDraft] = useState<FilterDraft>(EMPTY_DRAFT);
	const [openGroups, setOpenGroups] = useState<Record<GroupKey, boolean>>({
		service: true,
		device: false,
		rating: false,
		availability: false,
	});

	const toggleGroup = (key: GroupKey) => setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

	const clearAllHandler = () => {
		setDraft(EMPTY_DRAFT);
		const { latitude, longitude, radiusKm } = searchFilter.search;
		setSearchFilter({
			...searchFilter,
			page: 1,
			search: {
				isOnline: null,
				...(latitude != null && longitude != null
					? { latitude, longitude, radiusKm: radiusKm ?? DEFAULT_GEO_SEARCH_RADIUS_KM }
					: {}),
			},
		});
	};

	const applyHandler = () => {
		const search: TechniciansInquiry['search'] = {
			isOnline: draft.availability === 'availableNow' ? true : null,
		};

		const { latitude, longitude, radiusKm } = searchFilter.search;
		if (latitude != null && longitude != null) {
			search.latitude = latitude;
			search.longitude = longitude;
			search.radiusKm = radiusKm ?? DEFAULT_GEO_SEARCH_RADIUS_KM;
		}

		if (draft.service) {
			const deviceCategory = SERVICE_DEVICE_CATEGORY[draft.service];
			const issueCategory = SERVICE_ISSUE_CATEGORY[draft.service];
			if (deviceCategory) search.deviceCategory = deviceCategory;
			if (issueCategory) search.issueCategory = issueCategory;
		}
		if (draft.device !== 'all') {
			const deviceCategory = DEVICE_CATEGORY[draft.device];
			if (deviceCategory) search.deviceCategory = deviceCategory;
		}
		if (draft.rating) {
			search.minAverageRating = draft.rating;
		}

		setSearchFilter({ ...searchFilter, page: 1, search });
	};

	const groupHeader = (key: GroupKey, titleKey: string) => (
		<button type="button" className="fixora-search-filters__group-toggle" onClick={() => toggleGroup(key)}>
			<span className="fixora-search-filters__group-title">{t(titleKey)}</span>
			<KeyboardArrowDownRoundedIcon
				className={`fixora-search-filters__chevron${openGroups[key] ? ' fixora-search-filters__chevron--open' : ''}`}
			/>
		</button>
	);

	return (
		<aside className="fixora-search-filters">
			<div className="fixora-search-filters__header">
				<strong>{t('search.filters.title')}</strong>
				<button type="button" className="fixora-search-filters__clear" onClick={clearAllHandler}>
					{t('search.filters.reset')}
				</button>
			</div>

			<div className="fixora-search-filters__group">
				{groupHeader('service', 'search.filters.service.title')}
				{openGroups.service && (
					<div className="fixora-search-filters__group-body">
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
				)}
			</div>

			<div className="fixora-search-filters__group">
				{groupHeader('device', 'search.filters.device.title')}
				{openGroups.device && (
					<div className="fixora-search-filters__group-body">
						<RadioGroup
							value={draft.device}
							onChange={(_, value) => setDraft({ ...draft, device: value as (typeof DEVICES)[number] })}
						>
							{DEVICES.map((device) => (
								<label key={device} className="fixora-search-filters__option">
									<Radio value={device} size="small" />
									{t(`search.filters.device.${device}`)}
								</label>
							))}
						</RadioGroup>
					</div>
				)}
			</div>

			<div className="fixora-search-filters__group">
				{groupHeader('rating', 'search.filters.rating.title')}
				{openGroups.rating && (
					<div className="fixora-search-filters__group-body">
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
				)}
			</div>

			<div className="fixora-search-filters__group">
				{groupHeader('availability', 'search.filters.availability.title')}
				{openGroups.availability && (
					<div className="fixora-search-filters__group-body">
						<RadioGroup
							value={draft.availability}
							onChange={(_, value) => setDraft({ ...draft, availability: value as (typeof AVAILABILITY)[number] })}
						>
							{AVAILABILITY.map((option) => (
								<label key={option} className="fixora-search-filters__option">
									<Radio value={option} size="small" />
									{t(`search.filters.availability.${option}`)}
								</label>
							))}
						</RadioGroup>
					</div>
				)}
			</div>

			<button type="button" className="fixora-search-filters__apply" onClick={applyHandler}>
				{t('search.filters.apply')}
			</button>
		</aside>
	);
};

export default SearchFilters;
