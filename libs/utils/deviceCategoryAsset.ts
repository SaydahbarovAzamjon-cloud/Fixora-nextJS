import type { DeviceCategory } from '../types/fixora/fixora';

const DEVICE_CATEGORY_IMAGES: Record<DeviceCategory, string> = {
	IPHONE: '/img/devices/iphone.svg',
	IPAD: '/img/devices/ipad.svg',
	MACBOOK: '/img/devices/macbook.svg',
	APPLE_WATCH: '/img/devices/apple-watch.svg',
};

const DEFAULT_DEVICE_IMAGE = '/img/devices/iphone.svg';

/** Stock illustration for booking detail — never customer-uploaded photos. */
export function getDeviceCategoryImage(category?: DeviceCategory | string | null): string {
	if (!category) return DEFAULT_DEVICE_IMAGE;
	return DEVICE_CATEGORY_IMAGES[category as DeviceCategory] ?? DEFAULT_DEVICE_IMAGE;
}

export function formatBookingDisplayId(bookingId: string): string {
	const suffix = bookingId.replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase();
	return `#BK-${suffix || '00000'}`;
}
