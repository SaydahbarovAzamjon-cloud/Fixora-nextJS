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
import { SERVICE_ISSUE_CATEGORY, SERVICE_DEVICE_CATEGORY } from './categoryMappings';

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
		setSearchFilter({
			...searchFilter,
			page: 1,
			search: { ...searchFilter.search, issueCategory: chip.issueCategory, deviceCategory: chip.deviceCategory },
		});
	};

	const isCategoryActive = (chip: (typeof CATEGORY_CHIPS)[number]) => {
		if (chip.key === 'all') {
			return !searchFilter.search.issueCategory && !searchFilter.search.deviceCategory;
		}
		return searchFilter.search.issueCategory === chip.issueCategory && searchFilter.search.deviceCategory === chip.deviceCategory;
	};

	return (
		<div className="fixora-search-categories">
			{CATEGORY_CHIPS.map((chip) => (
				<button
					key={chip.key}
					type="button"
					className={`fixora-search-category${isCategoryActive(chip) ? ' fixora-search-category--active' : ''}`}
					onClick={() => categoryClickHandler(chip)}
				>
					<chip.Icon />
					<span>{t(`search.categories.${chip.key}`)}</span>
				</button>
			))}
		</div>
	);
};

export default SearchCategoryRow;
