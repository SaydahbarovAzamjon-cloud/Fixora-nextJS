import type { BookingType } from '../types/fixora/fixora';

/** i18n key in `common` namespace for a booking service type label. */
export function getBookingTypeLabelKey(type?: BookingType | null): string {
	if (type === 'ON_SITE') return 'booking.details.typeOnSite';
	return 'booking.details.typeShopVisit';
}
