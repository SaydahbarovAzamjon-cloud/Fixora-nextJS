import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Stack, Pagination } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import SearchHero from '../../libs/components/search/SearchHero';
import SearchCategoryRow from '../../libs/components/search/SearchCategoryRow';
import SearchFilters from '../../libs/components/search/SearchFilters';
import SearchResultsHeader from '../../libs/components/search/SearchResultsHeader';
import TechnicianResultCard from '../../libs/components/search/TechnicianResultCard';
import SearchTrustBar from '../../libs/components/search/SearchTrustBar';
import SearchRecommendations from '../../libs/components/search/SearchRecommendations';
import { GET_TECHNICIANS } from '../../apollo/user/query';
import { LIKE_TARGET_USER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { TechnicianSummary, TechniciansInquiry } from '../../libs/types/fixora/fixora';
import { Messages } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { notifySavedTechniciansChanged } from '../../libs/utils/savedTechnicians';
import { sortTechniciansList } from '../../libs/utils/sortTechnicians';
import {
	getTechniciansResultsInput,
	parseSearchPageQueryInput,
	serializeSearchPageQueryInput,
} from '../../libs/utils/technicianSearch';

const LocationCard = dynamic(() => import('../../libs/components/search/LocationCard'), { ssr: false });
const SearchMapExpandedSection = dynamic(
	() => import('../../libs/components/search/SearchMapExpandedSection'),
	{ ssr: false },
);

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
	// null = show online + offline (backend default omits isOnline → online-only only)
	search: { isOnline: null },
};

const SearchPage: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<TechniciansInquiry>(DEFAULT_INPUT);
	const [locationLabel, setLocationLabel] = useState('');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [mapExpanded, setMapExpanded] = useState(false);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [selectedMapTechnicianId, setSelectedMapTechnicianId] = useState<string | null>(null);
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [likeTargetUser] = useMutation(LIKE_TARGET_USER);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const techniciansQueryInput = useMemo(
		() => getTechniciansResultsInput(searchFilter),
		[searchFilter],
	);

	const { data, refetch } = useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'network-only',
		variables: { input: techniciansQueryInput },
		notifyOnNetworkStatusChange: true,
	});

	const locationChangeHandler = ({ label }: { label: string; lat: number; lng: number }) => {
		setLocationLabel(label);
	};

	const toggleFavoriteHandler = async (id: string) => {
		try {
			if (!id) return;
			if (!user?._id) throw new Error(Messages.error2);

			await likeTargetUser({ variables: { userId: id } });
			if (user._id) {
				notifySavedTechniciansChanged(user._id);
			}
			await refetch();
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const toggleFollowHandler = async (id: string, isFollowing: boolean) => {
		try {
			if (!id) return;
			if (!user?._id) throw new Error(Messages.error2);

			if (isFollowing) {
				await unsubscribe({ variables: { input: id } });
			} else {
				await subscribe({ variables: { input: id } });
				await sweetTopSmallSuccessAlert('Followed!', 800);
			}
			await refetch();
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const technicians = useMemo(() => {
		const list = (data?.getTechnicians?.list ?? []) as TechnicianSummary[];
		return sortTechniciansList(list, searchFilter);
	}, [data, searchFilter]);
	const total = data?.getTechnicians?.metaCounter?.[0]?.total ?? 0;

	useEffect(() => {
		if (!filtersOpen) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [filtersOpen]);

	useEffect(() => {
		const closeFilters = () => setFiltersOpen(false);
		router.events.on('routeChangeStart', closeFilters);
		return () => router.events.off('routeChangeStart', closeFilters);
	}, [router.events]);

	useEffect(() => {
		if (!router.query.input) return;
		try {
			const parsed = parseSearchPageQueryInput(router.query.input as string);
			setSearchFilter({
				...parsed,
				search: {
					isOnline: null,
					...parsed.search,
				},
			});
		} catch {
			// ignore malformed query
		}
	}, [router.query.input]);

	useEffect(() => {
		router.replace(`/search?input=${serializeSearchPageQueryInput(searchFilter)}`, undefined, { shallow: true });
	}, [router, searchFilter]);

	const paginationChangeHandler = (_: ChangeEvent<unknown>, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	return (
		<Stack className="fixora-search-page">
			<Stack className="container">
				<SearchHero searchFilter={searchFilter} setSearchFilter={setSearchFilter} />

				<SearchCategoryRow searchFilter={searchFilter} setSearchFilter={setSearchFilter} />

				<SearchRecommendations searchFilter={searchFilter} />

				{mapExpanded && (
					<SearchMapExpandedSection
						searchFilter={searchFilter}
						locationLabel={locationLabel || t('search.location.placeholder')}
						selectedTechnicianId={selectedMapTechnicianId}
						onSelectTechnician={setSelectedMapTechnicianId}
						onLocationChange={locationChangeHandler}
						onCollapse={() => setMapExpanded(false)}
					/>
				)}

				<Stack className={`fixora-search__layout${mapExpanded ? ' fixora-search__layout--map-expanded' : ''}`}>
					{isMobile && filtersOpen && (
						<button
							type="button"
							className="fixora-search__filters-backdrop"
							onClick={() => setFiltersOpen(false)}
							aria-label={t('search.filters.close')}
						/>
					)}

					<Stack
						className={`fixora-search__sidebar${isMobile ? ' fixora-search__sidebar--drawer' : ''}${filtersOpen ? ' fixora-search__sidebar--open' : ''}`}
					>
						{isMobile && (
							<div className="fixora-search__filters-drawer-head">
								<strong>{t('search.filters.title')}</strong>
								<button
									type="button"
									className="fixora-search__filters-close"
									onClick={() => setFiltersOpen(false)}
									aria-label={t('search.filters.close')}
								>
									<CloseIcon />
								</button>
							</div>
						)}
						<LocationCard
							locationLabel={locationLabel || t('search.location.placeholder')}
							searchFilter={searchFilter}
							onLocationChange={locationChangeHandler}
							selectedTechnicianId={selectedMapTechnicianId}
							onSelectTechnician={setSelectedMapTechnicianId}
							onExpandMap={() => setMapExpanded(true)}
							mapExpanded={mapExpanded}
						/>
						<SearchFilters searchFilter={searchFilter} setSearchFilter={setSearchFilter} />
					</Stack>

					<Stack className="fixora-search__results">
						{isMobile && !mapExpanded && (
							<button
								type="button"
								className="fixora-search__filters-toggle"
								onClick={() => setFiltersOpen(true)}
							>
								<TuneIcon fontSize="small" />
								{t('search.filters.title')}
							</button>
						)}

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
										favorited={!!technician.meLiked?.[0]?.myFavorite}
										following={!!technician.meFollowed?.[0]?.myFollowing}
										onToggleFavorite={toggleFavoriteHandler}
										onToggleFollow={toggleFollowHandler}
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
