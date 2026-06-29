/** Shared Swiper + layout sizing for all /technicians discovery carousels. */
export const TECHNICIAN_DISCOVERY_CAROUSEL_CONFIG = {
	spaceBetween: 12,
	carouselGap: 8,
	arrowSizePx: 36,
	defaultSlidesPerView: 1,
	centeredSlides: false,
	breakpoints: {
		640: {
			slidesPerView: 1,
			spaceBetween: 12,
			centeredSlides: false,
		},
		768: {
			slidesPerView: 2,
			spaceBetween: 14,
			centeredSlides: false,
		},
		992: {
			slidesPerView: 3,
			spaceBetween: 16,
			centeredSlides: false,
		},
		1280: {
			slidesPerView: 4,
			spaceBetween: 16,
			centeredSlides: false,
		},
	},
} as const;
