import React, { useMemo, useRef } from 'react';
import { Box } from '@mui/material';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { GET_TECHNICIANS } from '../../../apollo/user/query';
import { TechnicianSummary } from '../../types/fixora/fixora';
import TechnicianCard from '../homepage/TechnicianCard';

const TOP_INPUT = {
	page: 1,
	limit: 8,
	sort: 'averageRating',
	direction: 'DESC' as const,
	search: { isOnline: null },
};

const TechniciansTopSection = () => {
	const { t } = useTranslation('common');
	const prevRef = useRef<HTMLButtonElement>(null);
	const nextRef = useRef<HTMLButtonElement>(null);

	const { data } = useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'network-only',
		variables: { input: TOP_INPUT },
	});

	const technicians = useMemo(
		() => (data?.getTechnicians?.list ?? []) as TechnicianSummary[],
		[data],
	);

	if (technicians.length === 0) return null;

	const bindSwiperControls = (swiper: SwiperType) => {
		if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
			swiper.params.navigation.prevEl = prevRef.current;
			swiper.params.navigation.nextEl = nextRef.current;
			swiper.navigation.init();
			swiper.navigation.update();
		}
	};

	return (
		<section className="fixora-tech-list-section fixora-tech-list-section--top">
			<div className="fixora-tech-list-section__head">
				<h2>{t('technicians.sections.topRated')}</h2>
			</div>
			<Box component="div" className="fixora-tech-list-section__carousel">
				<button
					type="button"
					ref={prevRef}
					className="fixora-home-arrow fixora-tech-list-section__arrow fixora-tech-list-section__arrow--prev"
					aria-label={t('hero.recommended.prev')}
				>
					<ArrowBackIosNewIcon fontSize="small" />
				</button>
				<Swiper
					className="fixora-tech-list-section__swiper"
					modules={[Navigation]}
					slidesPerView={1}
					spaceBetween={16}
					preventClicksPropagation={false}
					navigation={{
						prevEl: prevRef.current,
						nextEl: nextRef.current,
					}}
					breakpoints={{
						640: { slidesPerView: 2 },
						960: { slidesPerView: 3 },
						1280: { slidesPerView: 4 },
					}}
					onBeforeInit={bindSwiperControls}
					onInit={bindSwiperControls}
					onResize={bindSwiperControls}
				>
					{technicians.map((tech) => (
						<SwiperSlide className="fixora-tech-list-section__slide" key={tech._id}>
							<TechnicianCard technician={tech} />
						</SwiperSlide>
					))}
				</Swiper>
				<button
					type="button"
					ref={nextRef}
					className="fixora-home-arrow fixora-tech-list-section__arrow fixora-tech-list-section__arrow--next"
					aria-label={t('hero.recommended.next')}
				>
					<ArrowForwardIosIcon fontSize="small" />
				</button>
			</Box>
		</section>
	);
};

export default TechniciansTopSection;
