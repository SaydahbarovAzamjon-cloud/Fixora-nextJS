import { Booking, BookingStatus } from '../../../types/fixora/fixora';

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ['PENDING', 'ACCEPTED', 'IN_PROGRESS'];

export const bookingRefId = (bookingId: string) => {
	const suffix = bookingId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
	return `RPR-${suffix || '0000'}`;
};

export const averageReviewScore = (review?: {
	repairQuality?: number;
	repairSpeed?: number;
	communication?: number;
}) => {
	if (!review) return null;
	const scores = [review.repairQuality, review.repairSpeed, review.communication].filter(
		(value) => typeof value === 'number',
	);
	if (!scores.length) return null;
	return scores.reduce((sum, value) => sum + value, 0) / scores.length;
};

export const deviceLabel = (
	booking: Booking,
	t: (key: string, fallback?: string) => string,
) => {
	const device = booking.deviceData;
	if (!device) return booking.problemTitle;
	const category = device.deviceCategory
		? t(`booking.device.categories.${device.deviceCategory}`, device.deviceCategory)
		: '';
	return `${category} ${device.deviceModel ?? ''}`.trim() || booking.problemTitle;
};

export const isReadyForPickup = (booking: Booking) => {
	if (booking.bookingStatus !== 'IN_PROGRESS') return false;
	const updates = booking.progressUpdates ?? [];
	const last = updates[updates.length - 1];
	const text = `${last?.step ?? ''} ${last?.note ?? ''}`.toLowerCase();
	return text.includes('pickup') || text.includes('ready');
};

export const bookingPrice = (booking: Booking) => Number(booking.finalPrice ?? booking.estimatedPrice ?? 0);
