import React, { useMemo } from 'react';
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
import TechnicianCard from './TechnicianCard';

interface TopTechniciansProps {
	initialInput?: TechniciansInquiry;
}

const DEFAULT_INPUT: TechniciansInquiry = {
	page: 1,
	limit: 8,
	sort: 'averageRating',
	direction: 'DESC',
	search: {},
};

const TopTechnicians = ({ initialInput = DEFAULT_INPUT }: TopTechniciansProps) => {
	const { t } = useTranslation('common');

	const { data } = useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'network-only',
		variables: { input: initialInput },
	});

	const technicians = useMemo(
		() => (data?.getTechnicians?.list ?? []) as TechnicianSummary[],
		[data],
	);

	if (technicians.length === 0) return null;

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
					<h2>{t('homepage.technicians.title')}</h2>
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
