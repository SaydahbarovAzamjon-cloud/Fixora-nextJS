import React from 'react';
import { Stack, Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';
import useDeviceDetect from '../../hooks/useDeviceDetect';

/** Static testimonials (display only, MVP) — content from i18n homepage.testimonials.items */
const TESTIMONIAL_KEYS = ['t1', 't2', 't3'] as const;

const Testimonials = () => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();

	const slides = TESTIMONIAL_KEYS.map((key) => (
		<SwiperSlide className="fixora-home-testimonials__slide" key={key}>
			<div className="fixora-testimonial-card">
				<FormatQuoteIcon className="fixora-testimonial-card__quote" />
				<p className="fixora-testimonial-card__text">{t(`homepage.testimonials.items.${key}.text`)}</p>
				<div className="fixora-testimonial-card__footer">
					<span className="fixora-testimonial-card__name">{t(`homepage.testimonials.items.${key}.name`)}</span>
					<span className="fixora-testimonial-card__rating">
						<StarIcon fontSize="inherit" />
						{t(`homepage.testimonials.items.${key}.rating`)}
					</span>
				</div>
			</div>
		</SwiperSlide>
	));

	return (
		<Stack className="fixora-home-section fixora-home-testimonials">
			<Stack className="container">
				<Box component="div" className="fixora-home-section__head">
					<h2>{t('homepage.testimonials.title')}</h2>
				</Box>

				{device === 'mobile' ? (
					<Swiper
						className="fixora-home-testimonials__swiper"
						slidesPerView="auto"
						centeredSlides
						spaceBetween={16}
						modules={[Autoplay, Pagination]}
						pagination={{ clickable: true }}
					>
						{slides}
					</Swiper>
				) : (
					<Box component="div" className="fixora-home-testimonials__wrapper">
						<Box component="div" className="fixora-home-arrow swiper-testimonials-prev">
							<ArrowBackIosNewIcon fontSize="small" />
						</Box>
						<Swiper
							className="fixora-home-testimonials__swiper"
							slidesPerView={3}
							spaceBetween={20}
							modules={[Autoplay, Navigation, Pagination]}
							navigation={{
								nextEl: '.swiper-testimonials-next',
								prevEl: '.swiper-testimonials-prev',
							}}
							pagination={{ el: '.fixora-home-testimonials__pagination', clickable: true }}
						>
							{slides}
						</Swiper>
						<Box component="div" className="fixora-home-arrow swiper-testimonials-next">
							<ArrowForwardIosIcon fontSize="small" />
						</Box>
					</Box>
				)}
				<div className="fixora-home-testimonials__pagination" />
			</Stack>
		</Stack>
	);
};

export default Testimonials;
