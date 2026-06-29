import React, { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export interface SearchHorizontalCarouselProps {
	className?: string;
	slideClassName?: string;
	spaceBetween?: number;
	children: React.ReactNode;
}

const SearchHorizontalCarousel = ({
	className = '',
	slideClassName = '',
	spaceBetween = 10,
	children,
}: SearchHorizontalCarouselProps) => {
	const { t } = useTranslation('common');
	const prevRef = useRef<HTMLButtonElement>(null);
	const nextRef = useRef<HTMLButtonElement>(null);
	const slides = React.Children.toArray(children).filter(Boolean);

	if (slides.length === 0) return null;

	const bindSwiperControls = (swiper: SwiperType) => {
		if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
			swiper.params.navigation.prevEl = prevRef.current;
			swiper.params.navigation.nextEl = nextRef.current;
			swiper.navigation.init();
			swiper.navigation.update();
		}
	};

	return (
		<div className={`fixora-search-carousel${className ? ` ${className}` : ''}`}>
			<button
				type="button"
				ref={prevRef}
				className="fixora-home-arrow fixora-search-carousel__arrow fixora-search-carousel__arrow--prev"
				aria-label={t('hero.recommended.prev')}
			>
				<ArrowBackIosNewIcon fontSize="small" />
			</button>

			<Swiper
				className="fixora-search-carousel__swiper"
				modules={[Navigation]}
				slidesPerView="auto"
				spaceBetween={spaceBetween}
				slidesOffsetBefore={4}
				slidesOffsetAfter={12}
				preventClicks={false}
				preventClicksPropagation={false}
				touchStartPreventDefault={false}
				threshold={12}
				shortSwipes
				watchOverflow
				observer
				observeParents
				navigation={{
					prevEl: prevRef.current,
					nextEl: nextRef.current,
				}}
				onBeforeInit={bindSwiperControls}
				onInit={bindSwiperControls}
				onResize={bindSwiperControls}
			>
				{slides.map((slide, index) => {
					const slideKey =
						React.isValidElement(slide) && slide.key != null ? String(slide.key) : `slide-${index}`;

					return (
						<SwiperSlide
							key={slideKey}
							className={`fixora-search-carousel__slide${slideClassName ? ` ${slideClassName}` : ''}`}
						>
							{slide}
						</SwiperSlide>
					);
				})}
			</Swiper>

			<button
				type="button"
				ref={nextRef}
				className="fixora-home-arrow fixora-search-carousel__arrow fixora-search-carousel__arrow--next"
				aria-label={t('hero.recommended.next')}
			>
				<ArrowForwardIosIcon fontSize="small" />
			</button>
		</div>
	);
};

export default SearchHorizontalCarousel;
