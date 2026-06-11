import React, { MouseEvent, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Menu, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { TechniciansInquiry } from '../../types/fixora/fixora';

interface SearchBarProps {
	searchFilter: TechniciansInquiry;
	setSearchFilter: (input: TechniciansInquiry) => void;
}

const SORT_OPTIONS = [
	{ id: 'bestMatch', sort: 'averageRating', direction: 'DESC' as const },
	{ id: 'mostJobs', sort: 'completedJobsCount', direction: 'DESC' as const },
];

const SearchBar = ({ searchFilter, setSearchFilter }: SearchBarProps) => {
	const { t } = useTranslation('common');
	const [searchText, setSearchText] = useState(searchFilter.search.text ?? '');
	const [sortAnchor, setSortAnchor] = useState<null | HTMLElement>(null);
	const [comingSoonAnchor, setComingSoonAnchor] = useState<null | HTMLElement>(null);

	const submitSearchText = () => {
		setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, text: searchText || undefined } });
	};

	const sortClickHandler = (e: MouseEvent<HTMLElement>) => setSortAnchor(e.currentTarget);
	const sortCloseHandler = () => setSortAnchor(null);

	const sortSelectHandler = (sort: string, direction: 'ASC' | 'DESC') => {
		setSearchFilter({ ...searchFilter, sort, direction });
		setSortAnchor(null);
	};

	const comingSoonClickHandler = (e: MouseEvent<HTMLElement>) => setComingSoonAnchor(e.currentTarget);
	const comingSoonCloseHandler = () => setComingSoonAnchor(null);

	return (
		<div className="fixora-search__searchbar">
			<div className="fixora-search-input">
				<SearchIcon />
				<input
					type="text"
					placeholder={t('search.searchPlaceholder')}
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') submitSearchText();
					}}
				/>
			</div>

			{(['location', 'service', 'rating', 'price', 'moreFilters'] as const).map((chip) => (
				<button key={chip} type="button" className="fixora-search-chip" onClick={comingSoonClickHandler}>
					{t(`search.chips.${chip}`)}
					<KeyboardArrowDownRoundedIcon fontSize="inherit" />
				</button>
			))}

			<Menu anchorEl={comingSoonAnchor} open={Boolean(comingSoonAnchor)} onClose={comingSoonCloseHandler}>
				<MenuItem disabled>{t('search.comingSoon')}</MenuItem>
			</Menu>

			<div className="fixora-search-sort">
				<span>{t('search.sort.label')}</span>
				<button type="button" className="fixora-search-chip" onClick={sortClickHandler}>
					{t('search.sort.bestMatch')}
					<KeyboardArrowDownRoundedIcon fontSize="inherit" />
				</button>
				<Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={sortCloseHandler}>
					{SORT_OPTIONS.map((option) => (
						<MenuItem key={option.id} onClick={() => sortSelectHandler(option.sort, option.direction)}>
							{t(`search.sort.${option.id}`)}
						</MenuItem>
					))}
				</Menu>
			</div>
		</div>
	);
};

export default SearchBar;
