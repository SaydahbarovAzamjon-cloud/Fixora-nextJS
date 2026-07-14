import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Stack, Box } from '@mui/material';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EastIcon from '@mui/icons-material/East';
import { GET_TECHNICIANS } from '../../../apollo/user/query';
import { TechnicianSummary, TechniciansInquiry } from '../../types/fixora/fixora';
import { TECHNICIAN_DISCOVERY_CAROUSEL_CONFIG } from '../../constants/technicianDiscoveryCarousel';
import { SEOUL_CENTER } from '../../kakao-maps';
import { useHomepageNearbySearch } from '../../hooks/useHomepageNearbySearch';
import FixoraButton from '../ui/FixoraButton';
import TechnicianCard from './TechnicianCard';

interface TopTechniciansProps {
	initialInput?: TechniciansInquiry;
}

/** Wider radius after the default ~30 km nearby search is empty. */
const WIDE_RADIUS_KM = 200;
/** Nationwide-ish radius so geo sort can still return the closest shops. */
const NEAREST_RADIUS_KM = 500;

type ExpandLevel = 'local' | 'wide' | 'nearest';

const GLOBAL_TOP: TechniciansInquiry = {
	page: 1,
	limit: 8,
	sort: 'averageRating',
	direction: 'DESC',
	search: {},
};

const TopTechnicians = ({ initialInput }: TopTechniciansProps) => {
	const { t } = useTranslation('common');
	const { search: nearbySearch, ready: nearbyReady } = useHomepageNearbySearch();
	const [expandLevel, setExpandLevel] = useState<ExpandLevel>('local');

	const hasCoords = nearbySearch.latitude != null && nearbySearch.longitude != null;
	const hasNearbyFilter =
		hasCoords || Boolean(nearbySearch.userLocation?.trim());

	useEffect(() => {
		setExpandLevel('local');
	}, [nearbySearch.latitude, nearbySearch.longitude, nearbySearch.userLocation]);

	const queryInput = useMemo<TechniciansInquiry>(() => {
		if (initialInput) return initialInput;
		if (!hasNearbyFilter) return GLOBAL_TOP;

		if (expandLevel === 'wide' && hasCoords) {
			return {
				page: 1,
				limit: 8,
				sort: 'averageRating',
				direction: 'DESC',
				search: {
					latitude: nearbySearch.latitude,
					longitude: nearbySearch.longitude,
					radiusKm: WIDE_RADIUS_KM,
				},
			};
		}

		if (expandLevel === 'nearest') {
			if (hasCoords) {
				return {
					page: 1,
					limit: 8,
					sort: 'averageRating',
					direction: 'DESC',
					search: {
						latitude: nearbySearch.latitude,
						longitude: nearbySearch.longitude,
						radiusKm: NEAREST_RADIUS_KM,
					},
				};
			}
			return {
				page: 1,
				limit: 8,
				sort: 'averageRating',
				direction: 'DESC',
				search: {
					latitude: SEOUL_CENTER.lat,
					longitude: SEOUL_CENTER.lng,
					radiusKm: WIDE_RADIUS_KM,
				},
			};
		}

		return {
			page: 1,
			limit: 8,
			sort: 'averageRating',
			direction: 'DESC',
			search: nearbySearch,
		};
	}, [initialInput, nearbySearch, hasNearbyFilter, hasCoords, expandLevel]);

	const skip = !initialInput && !nearbyReady;

	const { data, loading } = useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'network-only',
		variables: { input: queryInput },
		skip,
	});

	const technicians = useMemo(
		() => (data?.getTechnicians?.list ?? []) as TechnicianSummary[],
		[data],
	);

	useEffect(() => {
		if (skip || loading || initialInput || expandLevel !== 'wide') return;
		if (data && technicians.length === 0) {
			setExpandLevel('nearest');
		}
	}, [skip, loading, initialInput, expandLevel, data, technicians.length]);

	if (skip || loading) return null;

	const showExpandPrompt =
		!initialInput && hasNearbyFilter && expandLevel === 'local' && technicians.length === 0;

	const rangeHint =
		expandLevel === 'wide'
			? t('homepage.technicians.showingWide')
			: expandLevel === 'nearest'
				? t('homepage.technicians.showingNearest')
				: null;

	if (technicians.length === 0 && !showExpandPrompt) {
		return (
			<Stack className="fixora-home-section fixora-home-technicians">
				<Stack className="container">
					<Box component="div" className="fixora-home-section__head">
						<h2>{t('homepage.technicians.title')}</h2>
						<Link href="/technicians" className="fixora-home-section__view-all">
							{t('homepage.viewAll')} <EastIcon fontSize="inherit" />
						</Link>
					</Box>
					<p className="fixora-home-technicians__empty">{t('technicians.page.empty')}</p>
				</Stack>
			</Stack>
		);
	}

	if (showExpandPrompt) {
		return (
			<Stack className="fixora-home-section fixora-home-technicians">
				<Stack className="container">
					<Box component="div" className="fixora-home-section__head">
						<h2>{t('homepage.technicians.title')}</h2>
						<Link href="/technicians" className="fixora-home-section__view-all">
							{t('homepage.viewAll')} <EastIcon fontSize="inherit" />
						</Link>
					</Box>
					<div className="fixora-home-technicians__empty-card" role="status">
						<p className="fixora-home-technicians__empty-title">
							{t('homepage.technicians.nearbyEmpty')}
						</p>
						<p className="fixora-home-technicians__empty-desc">
							{t('homepage.technicians.expandPrompt')}
						</p>
						<FixoraButton
							variant="primary"
							onClick={() => setExpandLevel(hasCoords ? 'wide' : 'nearest')}
						>
							{t('homepage.technicians.expandCta')}
						</FixoraButton>
					</div>
				</Stack>
			</Stack>
		);
	}

	const slides = technicians.map((tech) => (
		<SwiperSlide className="fixora-home-technicians__slide" key={tech._id}>
			<div className="fixora-home-technicians__slide-inner">
				<TechnicianCard technician={tech} />
			</div>
		</SwiperSlide>
	));

	return (
		<Stack className="fixora-home-section fixora-home-technicians">
			<Stack className="container">
				<Box component="div" className="fixora-home-section__head">
					<div className="fixora-home-technicians__title-block">
						<h2>{t('homepage.technicians.title')}</h2>
						{rangeHint && <p className="fixora-home-technicians__range-hint">{rangeHint}</p>}
					</div>
					<Link href="/technicians" className="fixora-home-section__view-all">
						{t('homepage.viewAll')} <EastIcon fontSize="inherit" />
					</Link>
				</Box>

				<Box component="div" className="fixora-home-technicians__wrapper">
					<Box
						component="button"
						type="button"
						className="fixora-home-arrow fixora-home-technicians__arrow swiper-technicians-prev"
						aria-label={t('hero.recommended.prev')}
					>
						<ArrowBackIosNewIcon fontSize="small" />
					</Box>
					<Swiper
						className="fixora-home-technicians__swiper"
						modules={[Autoplay, Navigation]}
						preventClicksPropagation={false}
						slidesPerView={TECHNICIAN_DISCOVERY_CAROUSEL_CONFIG.defaultSlidesPerView}
						spaceBetween={TECHNICIAN_DISCOVERY_CAROUSEL_CONFIG.spaceBetween}
						centeredSlides={TECHNICIAN_DISCOVERY_CAROUSEL_CONFIG.centeredSlides}
						breakpoints={TECHNICIAN_DISCOVERY_CAROUSEL_CONFIG.breakpoints}
						navigation={{
							nextEl: '.swiper-technicians-next',
							prevEl: '.swiper-technicians-prev',
						}}
					>
						{slides}
					</Swiper>
					<Box
						component="button"
						type="button"
						className="fixora-home-arrow fixora-home-technicians__arrow swiper-technicians-next"
						aria-label={t('hero.recommended.next')}
					>
						<ArrowForwardIosIcon fontSize="small" />
					</Box>
				</Box>
			</Stack>
		</Stack>
	);
};

export default TopTechnicians;
