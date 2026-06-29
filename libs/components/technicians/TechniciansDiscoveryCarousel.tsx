import React, { useRef } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TechnicianCard from '../homepage/TechnicianCard';
import { TechnicianSummary } from '../../types/fixora/fixora';
import { TECHNICIAN_DISCOVERY_CAROUSEL_CONFIG } from '../../constants/technicianDiscoveryCarousel';

export interface TechniciansDiscoveryCarouselProps {
	titleKey: string;
	technicians: TechnicianSummary[];
	loading?: boolean;
	sectionClassName?: string;
	currentUserId?: string;
	onToggleFollow?: (id: string, isFollowing: boolean) => void;
}

const TechniciansDiscoveryCarousel = ({
	titleKey,
	technicians,
	loading = false,
	sectionClassName = '',
	currentUserId,
	onToggleFollow,
}: TechniciansDiscoveryCarouselProps) => {
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

	if (!loading && technicians.length === 0) {
		return null;
	}

	return (
		<section className={`fixora-tech-list-section${sectionClassName ? ` ${sectionClassName}` : ''}`}>
			<div className="fixora-tech-list-section__head">
				<h2>{t(titleKey)}</h2>
			</div>

			<Box component="div" className="fixora-tech-list-section__carousel">
				<button
					type="button"
					ref={prevRef}
					className="fixora-home-arrow fixora-tech-list-section__arrow fixora-tech-list-section__arrow--prev"
					aria-label={t('hero.recommended.prev')}
					tabIndex={loading && technicians.length === 0 ? -1 : 0}
				>
					<ArrowBackIosNewIcon fontSize="small" />
				</button>

				{loading && technicians.length === 0 ? (
					<div className="fixora-tech-list-section__track fixora-tech-list-section__loading" aria-busy="true">
						<span className="fixora-tech-list-section__loading-bar" />
						<span className="fixora-tech-list-section__loading-bar" />
						<span className="fixora-tech-list-section__loading-bar" />
						<span className="fixora-tech-list-section__loading-bar" />
					</div>
				) : (
					<Swiper
						className="fixora-tech-list-section__track fixora-tech-list-section__swiper"
						modules={[Navigation]}
						slidesPerView={TECHNICIAN_DISCOVERY_CAROUSEL_CONFIG.defaultSlidesPerView}
						spaceBetween={TECHNICIAN_DISCOVERY_CAROUSEL_CONFIG.spaceBetween}
						centeredSlides={TECHNICIAN_DISCOVERY_CAROUSEL_CONFIG.centeredSlides}
						preventClicksPropagation={false}
						watchOverflow
						observer
						observeParents
						navigation={{
							prevEl: prevRef.current,
							nextEl: nextRef.current,
						}}
						breakpoints={TECHNICIAN_DISCOVERY_CAROUSEL_CONFIG.breakpoints}
						onBeforeInit={bindSwiperControls}
						onInit={bindSwiperControls}
						onResize={bindSwiperControls}
					>
						{technicians.map((tech) => (
							<SwiperSlide className="fixora-tech-list-section__slide" key={tech._id}>
								<div className="fixora-tech-list-section__slide-inner">
									<TechnicianCard
										technician={tech}
										following={!!tech.meFollowed?.[0]?.myFollowing}
										currentUserId={currentUserId}
										onToggleFollow={onToggleFollow}
									/>
								</div>
							</SwiperSlide>
						))}
					</Swiper>
				)}

				<button
					type="button"
					ref={nextRef}
					className="fixora-home-arrow fixora-tech-list-section__arrow fixora-tech-list-section__arrow--next"
					aria-label={t('hero.recommended.next')}
					tabIndex={loading && technicians.length === 0 ? -1 : 0}
				>
					<ArrowForwardIosIcon fontSize="small" />
				</button>
			</Box>
		</section>
	);
};

export default TechniciansDiscoveryCarousel;
