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
import { useHomepageTestimonials } from '../../hooks/useHomepageTestimonials';

const DEFAULT_AVATAR = '/img/profile/defaultUser.svg';

const Testimonials = () => {
	const { t } = useTranslation('common');
	const { testimonials, loading } = useHomepageTestimonials();
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

	if (!loading && testimonials.length === 0) {
		return null;
	}

	const enableLoop = testimonials.length >= 3;

	return (
		<Stack className="fixora-home-section fixora-home-testimonials">
			<Stack className="container">
				<Box component="div" className="fixora-home-section__head">
					<h2>{t('homepage.testimonials.title')}</h2>
					<Link href="/technicians" className="fixora-home-section__view-all">
						{t('homepage.viewAll')} <EastIcon fontSize="inherit" />
					</Link>
				</Box>

				{loading && testimonials.length === 0 ? (
					<p className="fixora-home-testimonials__loading">{t('homepage.testimonials.loading')}</p>
				) : (
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
							loop={enableLoop}
							loopedSlides={enableLoop ? testimonials.length : undefined}
							loopAdditionalSlides={enableLoop ? 3 : undefined}
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
							{testimonials.map((item) => (
								<SwiperSlide className="fixora-home-testimonials__slide" key={item.id}>
									<div className="fixora-home-testimonials__slide-inner">
										<article className="fixora-testimonial-card">
											<FormatQuoteIcon className="fixora-testimonial-card__quote" aria-hidden="true" />
											<p className="fixora-testimonial-card__text">{item.text}</p>
											<div className="fixora-testimonial-card__footer">
												<div className="fixora-testimonial-card__author">
													<img
														src={item.avatar}
														alt=""
														className="fixora-testimonial-card__avatar"
														onError={(e) => {
															if (!e.currentTarget.src.endsWith('defaultUser.svg')) {
																e.currentTarget.src = DEFAULT_AVATAR;
															}
														}}
													/>
													<span className="fixora-testimonial-card__name">{item.name}</span>
												</div>
												<span className="fixora-testimonial-card__rating">
													<StarIcon fontSize="inherit" />
													{item.rating.toFixed(1)}
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
				)}

				<div ref={paginationRef} className="fixora-home-testimonials__pagination" />
			</Stack>
		</Stack>
	);
};

export default Testimonials;
