import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import SearchIcon from '@mui/icons-material/Search';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { TechniciansInquiry } from '../../types/fixora/fixora';
import { normalizeTechniciansInquiry, resolveTextSearchFilters } from '../../utils/technicianSearch';
import { SERVICE_ISSUE_CATEGORY, SERVICE_DEVICE_CATEGORY } from './categoryMappings';
import SearchHorizontalCarousel from './SearchHorizontalCarousel';
import { SEARCH_HERO_CHIP_CAROUSEL } from '../../constants/searchCarousel';

interface SearchHeroProps {
	searchFilter: TechniciansInquiry;
	setSearchFilter: (input: TechniciansInquiry) => void;
}

const POPULAR_SEARCHES = ['screenRepair', 'batteryIssue', 'waterDamage', 'iphoneRepair', 'macbookRepair'] as const;

const SearchHero = ({ searchFilter, setSearchFilter }: SearchHeroProps) => {
	const { t } = useTranslation('common');
	const [searchText, setSearchText] = useState(searchFilter.search.text ?? '');

	useEffect(() => {
		setSearchText(searchFilter.search.text ?? '');
	}, [searchFilter.search.text]);

	const applySearch = (value: string) => {
		const resolved = resolveTextSearchFilters(value, {
			screenRepair: t('search.filters.service.screenRepair'),
			batteryIssue: t('search.filters.service.batteryIssue'),
			waterDamage: t('search.filters.service.waterDamage'),
			iphoneRepair: t('search.filters.service.iphoneRepair'),
			macbookRepair: t('search.filters.service.macbookRepair'),
		});

		setSearchFilter(
			normalizeTechniciansInquiry({
				...searchFilter,
				page: 1,
				search: {
					...searchFilter.search,
					text: resolved.text,
					issueCategory: resolved.issueCategory,
					deviceCategory: resolved.deviceCategory,
					latitude: undefined,
					longitude: undefined,
					radiusKm: undefined,
				},
			}),
		);
	};

	const handleSearchInputChange = (value: string) => {
		setSearchText(value);
		if (!value.trim()) {
			const { text, issueCategory, deviceCategory, latitude, longitude, radiusKm, ...rest } = searchFilter.search;
			setSearchFilter(
				normalizeTechniciansInquiry({
					...searchFilter,
					page: 1,
					search: {
						...rest,
						isOnline: rest.isOnline ?? null,
					},
				}),
			);
		}
	};

	const submitSearchText = () => {
		applySearch(searchText);
	};

	const popularSearchHandler = (key: (typeof POPULAR_SEARCHES)[number]) => {
		const label = t(`search.filters.service.${key}`);
		setSearchText(label);
		setSearchFilter(
			normalizeTechniciansInquiry({
				...searchFilter,
				page: 1,
				search: {
					...searchFilter.search,
					text: label,
					issueCategory: SERVICE_ISSUE_CATEGORY[key],
					deviceCategory: SERVICE_DEVICE_CATEGORY[key],
					latitude: undefined,
					longitude: undefined,
					radiusKm: undefined,
				},
			}),
		);
	};

	return (
		<section className="fixora-search-hero">
			<div className="fixora-search-hero__top">
				<div className="fixora-search-hero__content">
					<h1 className="fixora-search-hero__title">
						{t('search.hero.titleLine1')}
						<br />
						{t('search.hero.titleLine2')} <em>{t('search.hero.titleAccent')}</em>
					</h1>
					<p className="fixora-search-hero__subtitle">{t('search.hero.subtitle')}</p>
				</div>

				<div className="fixora-search-hero__search-col">
					<div className="fixora-search-hero__searchbar">
						<SearchIcon className="fixora-search-hero__search-icon" />
						<input
							type="text"
							placeholder={t('search.hero.searchPlaceholder')}
							value={searchText}
							onChange={(e) => handleSearchInputChange(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') submitSearchText();
							}}
						/>
						<button type="button" className="fixora-search-hero__search-btn" onClick={submitSearchText}>
							<SearchIcon fontSize="small" />
							<span className="fixora-search-hero__search-btn-label">{t('search.hero.searchButton')}</span>
						</button>
					</div>

					<div className="fixora-search-hero__popular">
						<span className="fixora-search-hero__popular-label">{t('search.hero.popularSearches')}</span>
						<SearchHorizontalCarousel
							className="fixora-search-hero__popular-carousel"
							slideClassName="fixora-search-hero__popular-slide"
							spaceBetween={SEARCH_HERO_CHIP_CAROUSEL.spaceBetween}
						>
							{POPULAR_SEARCHES.map((key) => (
								<button
									key={key}
									type="button"
									className="fixora-search-chip swiper-no-swiping"
									onClick={() => popularSearchHandler(key)}
								>
									{t(`search.filters.service.${key}`)}
								</button>
							))}
						</SearchHorizontalCarousel>
					</div>
				</div>

				<div className="fixora-search-hero__illustration" aria-hidden="true">
					<span className="fixora-search-hero__orbit" />
					<span className="fixora-search-hero__spark fixora-search-hero__spark--1" />
					<span className="fixora-search-hero__spark fixora-search-hero__spark--2" />
					<span className="fixora-search-hero__app fixora-search-hero__app--1">
						<SmartphoneIcon fontSize="small" />
					</span>
					<span className="fixora-search-hero__app fixora-search-hero__app--2">
						<ChatBubbleOutlineIcon fontSize="small" />
					</span>
					<span className="fixora-search-hero__app fixora-search-hero__app--3">
						<BuildOutlinedIcon fontSize="small" />
					</span>
					<span className="fixora-search-hero__app fixora-search-hero__app--4">
						<BatteryAlertIcon fontSize="small" />
					</span>
					<div className="fixora-search-hero__phone">
						<img src="/img/logo/logo-icon.png" alt="" />
					</div>
				</div>
			</div>
		</section>
	);
};

export default SearchHero;
