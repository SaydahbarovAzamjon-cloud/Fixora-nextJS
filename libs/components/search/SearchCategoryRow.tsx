import React from 'react';
import { useTranslation } from 'next-i18next';
import AppsIcon from '@mui/icons-material/Apps';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { TechniciansInquiry } from '../../types/fixora/fixora';
import { normalizeTechniciansInquiry } from '../../utils/technicianSearch';
import { SERVICE_ISSUE_CATEGORY, SERVICE_DEVICE_CATEGORY } from './categoryMappings';
import SearchHorizontalCarousel from './SearchHorizontalCarousel';
import { SEARCH_CATEGORY_CAROUSEL } from '../../constants/searchCarousel';

interface SearchCategoryRowProps {
	searchFilter: TechniciansInquiry;
	setSearchFilter: (input: TechniciansInquiry) => void;
}

const CATEGORY_CHIPS = [
	{ key: 'all', Icon: AppsIcon, issueCategory: undefined, deviceCategory: undefined },
	{ key: 'screenRepair', Icon: SmartphoneIcon, issueCategory: SERVICE_ISSUE_CATEGORY.screenRepair, deviceCategory: undefined },
	{ key: 'batteryIssue', Icon: BatteryAlertIcon, issueCategory: SERVICE_ISSUE_CATEGORY.batteryIssue, deviceCategory: undefined },
	{ key: 'waterDamage', Icon: WaterDropIcon, issueCategory: SERVICE_ISSUE_CATEGORY.waterDamage, deviceCategory: undefined },
	{ key: 'iphoneRepair', Icon: PhoneIphoneIcon, issueCategory: undefined, deviceCategory: SERVICE_DEVICE_CATEGORY.iphoneRepair },
	{ key: 'macbookRepair', Icon: LaptopMacIcon, issueCategory: undefined, deviceCategory: SERVICE_DEVICE_CATEGORY.macbookRepair },
	{ key: 'others', Icon: MoreHorizIcon, issueCategory: 'GENERAL', deviceCategory: undefined },
] as const;

const SearchCategoryRow = ({ searchFilter, setSearchFilter }: SearchCategoryRowProps) => {
	const { t } = useTranslation('common');

	const categoryClickHandler = (chip: (typeof CATEGORY_CHIPS)[number]) => {
		const { latitude, longitude, radiusKm, minAverageRating, maxAvgResponseMinutes, userLocation, isOnline } =
			searchFilter.search;

		const sharedSearch: TechniciansInquiry['search'] = {
			isOnline: isOnline ?? null,
		};

		if (latitude != null && longitude != null) {
			sharedSearch.latitude = latitude;
			sharedSearch.longitude = longitude;
			sharedSearch.radiusKm = radiusKm ?? undefined;
		}
		if (minAverageRating != null) sharedSearch.minAverageRating = minAverageRating;
		if (maxAvgResponseMinutes != null) sharedSearch.maxAvgResponseMinutes = maxAvgResponseMinutes;
		if (userLocation?.trim()) sharedSearch.userLocation = userLocation.trim();

		if (chip.key === 'all') {
			setSearchFilter(
				normalizeTechniciansInquiry({
					...searchFilter,
					page: 1,
					search: sharedSearch,
				}),
			);
			return;
		}

		setSearchFilter(
			normalizeTechniciansInquiry({
				...searchFilter,
				page: 1,
				search: {
					...sharedSearch,
					issueCategory: chip.issueCategory,
					deviceCategory: chip.deviceCategory,
				},
			}),
		);
	};

	const isCategoryActive = (chip: (typeof CATEGORY_CHIPS)[number]) => {
		const { issueCategory, deviceCategory, text } = searchFilter.search;
		if (chip.key === 'all') {
			return !issueCategory && !deviceCategory && !text?.trim();
		}
		return issueCategory === chip.issueCategory && deviceCategory === chip.deviceCategory;
	};

	return (
		<SearchHorizontalCarousel
			className="fixora-search-categories"
			slideClassName="fixora-search-categories__slide"
			spaceBetween={SEARCH_CATEGORY_CAROUSEL.spaceBetween}
		>
			{CATEGORY_CHIPS.map((chip) => (
				<button
					key={chip.key}
					type="button"
					className={`fixora-search-category swiper-no-swiping${isCategoryActive(chip) ? ' fixora-search-category--active' : ''}`}
					onClick={() => categoryClickHandler(chip)}
				>
					<chip.Icon />
					<span>{t(`search.categories.${chip.key}`)}</span>
				</button>
			))}
		</SearchHorizontalCarousel>
	);
};

export default SearchCategoryRow;
