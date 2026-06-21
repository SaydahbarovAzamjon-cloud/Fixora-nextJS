/** Shared Swiper + layout sizing for all /technicians discovery carousels. */
export const TECHNICIAN_DISCOVERY_CAROUSEL_CONFIG = {
	spaceBetween: 16,
	carouselGap: 12,
	arrowSizePx: 36,
	defaultSlidesPerView: 1,
	breakpoints: {
		640: { slidesPerView: 2 },
		960: { slidesPerView: 3 },
		1280: { slidesPerView: 4 },
	},
} as const;
