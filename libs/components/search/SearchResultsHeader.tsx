import React, { MouseEvent, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { TechniciansInquiry } from '../../types/fixora/fixora';

interface SearchResultsHeaderProps {
	total: number;
	searchFilter: TechniciansInquiry;
	setSearchFilter: (input: TechniciansInquiry) => void;
	viewMode: 'grid' | 'list';
	setViewMode: (mode: 'grid' | 'list') => void;
}

const SORT_OPTIONS = [
	{ id: 'recommended', sort: 'averageRating', direction: 'DESC' as const },
	{ id: 'mostJobs', sort: 'completedJobsCount', direction: 'DESC' as const },
];

const SearchResultsHeader = ({ total, searchFilter, setSearchFilter, viewMode, setViewMode }: SearchResultsHeaderProps) => {
	const { t } = useTranslation('common');
	const [sortAnchor, setSortAnchor] = useState<null | HTMLElement>(null);

	const sortClickHandler = (e: MouseEvent<HTMLElement>) => setSortAnchor(e.currentTarget);
	const sortCloseHandler = () => setSortAnchor(null);

	const sortSelectHandler = (sort: string, direction: 'ASC' | 'DESC') => {
		setSearchFilter({ ...searchFilter, page: 1, sort, direction });
		setSortAnchor(null);
	};

	const activeSort =
		SORT_OPTIONS.find(
			(option) => option.sort === searchFilter.sort && option.direction === searchFilter.direction,
		) ?? SORT_OPTIONS[0];

	return (
		<div className="fixora-search__results-header">
			<span className="fixora-search__results-count">{t('search.results.count', { count: total })}</span>

			<div className="fixora-search-sort">
				<span>{t('search.sort.label')}</span>
				<button type="button" className="fixora-search-chip" onClick={sortClickHandler}>
					{t(`search.sort.${activeSort.id}`)}
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

			<div className="fixora-search__view-toggle">
				<button
					type="button"
					className={viewMode === 'grid' ? 'fixora-search__view-toggle-btn--active' : 'fixora-search__view-toggle-btn'}
					aria-label="grid view"
					onClick={() => setViewMode('grid')}
				>
					<GridViewIcon fontSize="small" />
				</button>
				<button
					type="button"
					className={viewMode === 'list' ? 'fixora-search__view-toggle-btn--active' : 'fixora-search__view-toggle-btn'}
					aria-label="list view"
					onClick={() => setViewMode('list')}
				>
					<ViewListIcon fontSize="small" />
				</button>
			</div>
		</div>
	);
};

export default SearchResultsHeader;
