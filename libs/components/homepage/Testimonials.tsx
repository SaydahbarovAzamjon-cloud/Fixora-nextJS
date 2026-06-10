import React, { useRef } from 'react';
import Link from 'next/link';
import { Stack, Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination } from 'swiper';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EastIcon from '@mui/icons-material/East';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';

/** 9 static testimonials — one per coverflow slide (display only, MVP) */
const TESTIMONIALS = [
	{ key: 't1', avatar: '/img/testimonials/avatar-1.png' },
	{ key: 't2', avatar: '/img/testimonials/avatar-2.png' },
	{ key: 't3', avatar: '/img/testimonials/avatar-3.png' },
	{ key: 't4', avatar: '/img/testimonials/avatar-2.png' },
	{ key: 't5', avatar: '/img/testimonials/avatar-3.png' },
	{ key: 't6', avatar: '/img/testimonials/avatar-1.png' },
	{ key: 't7', avatar: '/img/testimonials/avatar-3.png' },
	{ key: 't8', avatar: '/img/testimonials/avatar-1.png' },
	{ key: 't9', avatar: '/img/testimonials/avatar-2.png' },
] as const;

const Testimonials = () => {
	const { t } = useTranslation('common');
	const prevRef = useRef<HTMLButtonElement>(null);
	const nextRef = useRef<HTMLButtonElement>(null);
	const paginationRef = useRef<HTMLDivElement>(null);

	const bindSwiperControls = (swiper: SwiperType) => {
		if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
			swiper.params.navigation.prevEl = prevRef.current;
			swiper.params.navigation.nextEl = nextRef.current;
			swiper.navigation.init();
			swiper.navigation.update();
		}
		if (swiper.params.pagination && typeof swiper.params.pagination !== 'boolean') {
			swiper.params.pagination.el = paginationRef.current;
			swiper.pagination.init();
			swiper.pagination.render();
			swiper.pagination.update();
		}
	};

	return (
		<Stack className="fixora-home-section fixora-home-testimonials">
			<Stack className="container">
				<Box component="div" className="fixora-home-section__head">
					<h2>{t('homepage.testimonials.title')}</h2>
					<Link href="/community" className="fixora-home-section__view-all">
						{t('homepage.viewAll')} <EastIcon fontSize="inherit" />
					</Link>
				</Box>

				<Box component="div" className="fixora-home-testimonials__carousel">
					<button
						type="button"
						ref={prevRef}
						className="fixora-home-testimonials__arrow fixora-home-testimonials__arrow--prev"
						aria-label={t('homepage.testimonials.prev')}
					>
						<ArrowBackIosNewIcon fontSize="small" />
					</button>

					<Swiper
						className="fixora-home-testimonials__swiper"
						modules={[Navigation, Pagination]}
						centeredSlides
						slidesPerView="auto"
						slidesPerGroup={1}
						spaceBetween={0}
						speed={450}
						loop
						loopedSlides={TESTIMONIALS.length}
						loopAdditionalSlides={3}
						slideToClickedSlide
						watchSlidesProgress
						navigation={{
							prevEl: prevRef.current,
							nextEl: nextRef.current,
						}}
						pagination={{
							el: paginationRef.current,
							clickable: true,
							dynamicBullets: true,
							dynamicMainBullets: 5,
						}}
						onBeforeInit={bindSwiperControls}
						onInit={bindSwiperControls}
						onSlideChangeTransitionEnd={(swiper) => swiper.update()}
					>
						{TESTIMONIALS.map(({ key, avatar }) => (
							<SwiperSlide className="fixora-home-testimonials__slide" key={key}>
								<div className="fixora-home-testimonials__slide-inner">
									<article className="fixora-testimonial-card">
										<FormatQuoteIcon className="fixora-testimonial-card__quote" aria-hidden="true" />
										<p className="fixora-testimonial-card__text">
											{t(`homepage.testimonials.items.${key}.text`)}
										</p>
										<div className="fixora-testimonial-card__footer">
											<div className="fixora-testimonial-card__author">
												<img src={avatar} alt="" className="fixora-testimonial-card__avatar" />
												<span className="fixora-testimonial-card__name">
													{t(`homepage.testimonials.items.${key}.name`)}
												</span>
											</div>
											<span className="fixora-testimonial-card__rating">
												<StarIcon fontSize="inherit" />
												{t(`homepage.testimonials.items.${key}.rating`)}
											</span>
										</div>
									</article>
								</div>
							</SwiperSlide>
						))}
					</Swiper>

					<button
						type="button"
						ref={nextRef}
						className="fixora-home-testimonials__arrow fixora-home-testimonials__arrow--next"
						aria-label={t('homepage.testimonials.next')}
					>
						<ArrowForwardIosIcon fontSize="small" />
					</button>
				</Box>

				<div ref={paginationRef} className="fixora-home-testimonials__pagination" />
			</Stack>
		</Stack>
	);
};

export default Testimonials;
