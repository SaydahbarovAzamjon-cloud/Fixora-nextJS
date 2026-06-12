import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery } from '@apollo/client';
import { Stack, Pagination } from '@mui/material';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import SearchHero from '../../libs/components/search/SearchHero';
import SearchCategoryRow from '../../libs/components/search/SearchCategoryRow';
import LocationCard from '../../libs/components/search/LocationCard';
import SearchFilters from '../../libs/components/search/SearchFilters';
import SearchResultsHeader from '../../libs/components/search/SearchResultsHeader';
import TechnicianResultCard from '../../libs/components/search/TechnicianResultCard';
import SearchTrustBar from '../../libs/components/search/SearchTrustBar';
import { GET_TECHNICIANS } from '../../apollo/user/query';
import { TechnicianSummary, TechniciansInquiry } from '../../libs/types/fixora/fixora';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const DEFAULT_INPUT: TechniciansInquiry = {
	page: 1,
	limit: 10,
	sort: 'averageRating',
	direction: 'DESC',
	search: {},
};

const SearchPage: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<TechniciansInquiry>(DEFAULT_INPUT);
	const [technicians, setTechnicians] = useState<TechnicianSummary[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

	const toggleFavoriteHandler = (id: string) => {
		setFavoritedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const { data, refetch } = useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTechnicians(data?.getTechnicians?.list ?? []);
			setTotal(data?.getTechnicians?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (router.query.input) {
			setSearchFilter(JSON.parse(router.query.input as string));
		}
	}, [router]);

	useEffect(() => {
		router.replace(`/search?input=${JSON.stringify(searchFilter)}`, undefined, { shallow: true });
		refetch({ input: searchFilter });
	}, [searchFilter]);

	const paginationChangeHandler = (_: ChangeEvent<unknown>, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	return (
		<Stack className="fixora-search-page">
			<Stack className="container">
				<SearchHero searchFilter={searchFilter} setSearchFilter={setSearchFilter} />

				<SearchCategoryRow searchFilter={searchFilter} setSearchFilter={setSearchFilter} />

				<Stack className="fixora-search__layout">
					<Stack className="fixora-search__sidebar">
						<LocationCard />
						<SearchFilters searchFilter={searchFilter} setSearchFilter={setSearchFilter} />
					</Stack>

					<Stack className="fixora-search__results">
						<SearchResultsHeader
							total={total}
							searchFilter={searchFilter}
							setSearchFilter={setSearchFilter}
							viewMode={viewMode}
							setViewMode={setViewMode}
						/>

						{technicians.length === 0 ? (
							<div className="fixora-search__no-results">{t('search.results.noResults')}</div>
						) : (
							<Stack className={`fixora-search__results-list fixora-search__results-list--${viewMode}`}>
								{technicians.map((technician) => (
									<TechnicianResultCard
										key={technician._id}
										technician={technician}
										view={viewMode}
										favorited={favoritedIds.has(technician._id)}
										onToggleFavorite={toggleFavoriteHandler}
									/>
								))}
							</Stack>
						)}

						{technicians.length !== 0 && Math.ceil(total / searchFilter.limit) > 1 && (
							<Stack className="fixora-search__pagination">
								<Pagination
									page={searchFilter.page}
									count={Math.ceil(total / searchFilter.limit)}
									onChange={paginationChangeHandler}
									shape="circular"
									color="primary"
								/>
							</Stack>
						)}
					</Stack>
				</Stack>

				<SearchTrustBar />
			</Stack>
		</Stack>
	);
};

export default withLayoutFull(SearchPage);
