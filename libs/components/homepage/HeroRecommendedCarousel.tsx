import React from 'react';
import { Box } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
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

const HeroRecommendedCarousel = ({ recommendations }: HeroRecommendedCarouselProps) => (
	<div className="fixora-hero__cards-wrap">
		<Box component="div" className="fixora-home-arrow swiper-hero-tech-prev" aria-hidden="true">
			<ArrowBackIosNewIcon fontSize="small" />
		</Box>
		<Swiper
			className="fixora-hero__swiper"
			modules={[Navigation]}
			spaceBetween={16}
			slidesPerView={1}
			watchOverflow
			navigation={{
				prevEl: '.swiper-hero-tech-prev',
				nextEl: '.swiper-hero-tech-next',
			}}
			breakpoints={{
				600: { slidesPerView: 2 },
				900: { slidesPerView: 3 },
				1200: { slidesPerView: 4 },
				1500: { slidesPerView: 5 },
			}}
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
		<Box component="div" className="fixora-home-arrow swiper-hero-tech-next" aria-hidden="true">
			<ArrowForwardIosIcon fontSize="small" />
		</Box>
	</div>
);

export default HeroRecommendedCarousel;
