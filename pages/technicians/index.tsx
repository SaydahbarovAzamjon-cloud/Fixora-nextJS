import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Stack, Pagination } from '@mui/material';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import SearchHero from '../../libs/components/search/SearchHero';
import SearchCategoryRow from '../../libs/components/search/SearchCategoryRow';
import SearchFilters from '../../libs/components/search/SearchFilters';
import SearchResultsHeader from '../../libs/components/search/SearchResultsHeader';
import TechnicianResultCard from '../../libs/components/search/TechnicianResultCard';
import TechniciansPageStats from '../../libs/components/technicians/TechniciansPageStats';
import TechniciansTopSection from '../../libs/components/technicians/TechniciansTopSection';
import TechniciansNewSection from '../../libs/components/technicians/TechniciansNewSection';
import { GET_TECHNICIANS } from '../../apollo/user/query';
import { LIKE_TARGET_USER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { TechnicianSummary, TechniciansInquiry } from '../../libs/types/fixora/fixora';
import { DEFAULT_GEO_SEARCH_RADIUS_KM } from '../../libs/kakao-maps';
import { Messages } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { setSavedTechnicianLiked } from '../../libs/utils/savedTechnicians';

const LocationCard = dynamic(() => import('../../libs/components/search/LocationCard'), { ssr: false });

const KAKAO_MAPS_SDK_SRC = process.env.NEXT_PUBLIC_KAKAO_JS_KEY
	? `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&autoload=false&libraries=services`
	: '';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const DEFAULT_INPUT: TechniciansInquiry = {
	page: 1,
	limit: 10,
	sort: 'averageRating',
	direction: 'DESC',
	search: { isOnline: null },
};

const TechniciansListPage: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<TechniciansInquiry>(DEFAULT_INPUT);
	const [locationLabel, setLocationLabel] = useState('');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const user = useReactiveVar(userVar);

	const [likeTargetUser] = useMutation(LIKE_TARGET_USER);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const locationChangeHandler = ({ label, lat, lng }: { label: string; lat: number; lng: number }) => {
		setLocationLabel(label);
		setSearchFilter((prev) => ({
			...prev,
			page: 1,
			search: {
				...prev.search,
				isOnline: prev.search.isOnline ?? null,
				latitude: lat,
				longitude: lng,
				radiusKm: prev.search.radiusKm ?? DEFAULT_GEO_SEARCH_RADIUS_KM,
			},
		}));
	};

	const toggleFavoriteHandler = async (id: string) => {
		try {
			if (!id) return;
			if (!user?._id) throw new Error(Messages.error2);
			const { data } = await likeTargetUser({ variables: { userId: id } });
			if (user._id) {
				const myFavorite = !!data?.likeTargetUser?.meLiked?.[0]?.myFavorite;
				setSavedTechnicianLiked(user._id, id, myFavorite);
			}
			await refetch({ input: searchFilter });
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
			await refetch({ input: searchFilter });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const { data, refetch } = useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
	});

	const technicians = useMemo(
		() => (data?.getTechnicians?.list ?? []) as TechnicianSummary[],
		[data],
	);
	const total = data?.getTechnicians?.metaCounter?.[0]?.total ?? 0;

	useEffect(() => {
		if (!router.query.input) return;
		try {
			const parsed = JSON.parse(router.query.input as string) as TechniciansInquiry;
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
		if (!router.isReady) return;
		router.replace(`/technicians?input=${JSON.stringify(searchFilter)}`, undefined, { shallow: true });
		refetch({ input: searchFilter });
	}, [searchFilter]);

	const paginationChangeHandler = (_: ChangeEvent<unknown>, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	return (
		<Stack className="fixora-tech-list-page">
			{KAKAO_MAPS_SDK_SRC ? (
				<Script id="fixora-kakao-maps-sdk-tech-list" src={KAKAO_MAPS_SDK_SRC} strategy="afterInteractive" />
			) : null}
			<Stack className="container">
				<header className="fixora-tech-list-page__header">
					<h1>{t('technicians.page.title')}</h1>
					<p>{t('technicians.page.subtitle')}</p>
				</header>

				<TechniciansPageStats />
				<TechniciansTopSection />

				<SearchHero searchFilter={searchFilter} setSearchFilter={setSearchFilter} />
				<SearchCategoryRow searchFilter={searchFilter} setSearchFilter={setSearchFilter} />

				<Stack className="fixora-search__layout">
					<Stack className="fixora-search__sidebar">
						<LocationCard
							locationLabel={locationLabel || t('search.location.placeholder')}
							technicians={technicians}
							onLocationChange={locationChangeHandler}
						/>
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

				<TechniciansNewSection />
			</Stack>
		</Stack>
	);
};

export default withLayoutFull(TechniciansListPage);
