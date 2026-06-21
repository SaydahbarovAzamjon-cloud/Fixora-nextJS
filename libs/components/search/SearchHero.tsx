import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import SearchIcon from '@mui/icons-material/Search';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { TechniciansInquiry } from '../../types/fixora/fixora';

interface SearchHeroProps {
	searchFilter: TechniciansInquiry;
	setSearchFilter: (input: TechniciansInquiry) => void;
}

const POPULAR_SEARCHES = ['screenRepair', 'batteryIssue', 'waterDamage', 'iphoneRepair', 'macbookRepair'] as const;

const SearchHero = ({ searchFilter, setSearchFilter }: SearchHeroProps) => {
	const { t } = useTranslation('common');
	const [searchText, setSearchText] = useState(searchFilter.search.text ?? '');

	const handleSearchInputChange = (value: string) => {
		setSearchText(value);
		if (!value.trim()) {
			setSearchFilter({
				...searchFilter,
				page: 1,
				search: { ...searchFilter.search, text: undefined },
			});
		}
	};

	const submitSearchText = () => {
		setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, text: searchText || undefined } });
	};

	const popularSearchHandler = (key: (typeof POPULAR_SEARCHES)[number]) => {
		const label = t(`search.filters.service.${key}`);
		setSearchText(label);
		setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, text: label } });
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
							{t('search.hero.searchButton')}
						</button>
					</div>

					<div className="fixora-search-hero__popular">
						<span>{t('search.hero.popularSearches')}</span>
						{POPULAR_SEARCHES.map((key) => (
							<button key={key} type="button" className="fixora-search-chip" onClick={() => popularSearchHandler(key)}>
								{t(`search.filters.service.${key}`)}
							</button>
						))}
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
