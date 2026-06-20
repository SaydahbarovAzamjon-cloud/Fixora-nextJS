import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useTranslation } from 'next-i18next';
import TechnicianCard from './TechnicianCard';
import { TechnicianSummary } from '../../types/fixora/fixora';

export interface HeroRecommendation {
	technicianId: string;
	score: number;
	matchReason: string;
	technician: TechnicianSummary;
}

interface HeroRecommendedCarouselProps {
	recommendations: HeroRecommendation[];
}

const HeroRecommendedCarousel = ({ recommendations }: HeroRecommendedCarouselProps) => {
	const { t } = useTranslation('common');
	const prevRef = useRef<HTMLButtonElement>(null);
	const nextRef = useRef<HTMLButtonElement>(null);

	const bindSwiperControls = (swiper: SwiperType) => {
		if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
			swiper.params.navigation.prevEl = prevRef.current;
			swiper.params.navigation.nextEl = nextRef.current;
			swiper.navigation.init();
			swiper.navigation.update();
		}
	};

	return (
		<div className="fixora-hero__cards-wrap">
			<button
				type="button"
				ref={prevRef}
				className="fixora-home-arrow fixora-hero__arrow fixora-hero__arrow--prev"
				aria-label={t('hero.recommended.prev')}
			>
				<ArrowBackIosNewIcon fontSize="small" />
			</button>
			<Swiper
				className="fixora-hero__swiper"
				modules={[Navigation]}
				spaceBetween={16}
				slidesPerView={1}
				slidesPerGroup={1}
				speed={450}
				watchOverflow
				preventClicksPropagation={false}
				navigation={{
					prevEl: prevRef.current,
					nextEl: nextRef.current,
				}}
				breakpoints={{
					640: { slidesPerView: 2, slidesPerGroup: 1 },
					960: { slidesPerView: 3, slidesPerGroup: 1 },
					1280: { slidesPerView: 4, slidesPerGroup: 1 },
				}}
				onBeforeInit={bindSwiperControls}
				onInit={bindSwiperControls}
				onResize={bindSwiperControls}
			>
				{recommendations.map((rec) => (
					<SwiperSlide className="fixora-hero__slide" key={rec.technicianId}>
						<div className="fixora-hero__card">
							<TechnicianCard technician={rec.technician} />
							<small className="fixora-hero__card-reason">{rec.matchReason}</small>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
			<button
				type="button"
				ref={nextRef}
				className="fixora-home-arrow fixora-hero__arrow fixora-hero__arrow--next"
				aria-label={t('hero.recommended.next')}
			>
				<ArrowForwardIosIcon fontSize="small" />
			</button>
		</div>
	);
};

export default HeroRecommendedCarousel;
