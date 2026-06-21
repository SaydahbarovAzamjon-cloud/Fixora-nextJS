import { useMemo } from 'react';
import { Booking, BookingReview, Payment } from '../types/fixora/fixora';

const reviewScore = (review: BookingReview) => {
	const scores = [review.repairQuality, review.repairSpeed, review.communication].filter(
		(value) => typeof value === 'number',
	);
	if (!scores.length) return null;
	return scores.reduce((sum, value) => sum + value, 0) / scores.length;
};

const bookingPrice = (booking: Booking) => Number(booking.finalPrice ?? booking.estimatedPrice ?? 0);

export interface ClientMyPageStats {
	repairsCount: number;
	completedCount: number;
	reviewsCount: number;
	followingCount: number;
	savedCount: number;
	avgRatingGiven: number | null;
	totalSpent: number;
	uniqueDevicesRepaired: number;
}

interface UseClientMyPageStatsInput {
	bookings: Booking[];
	reviews: BookingReview[];
	payments?: Payment[];
	bookingsTotal?: number;
	reviewsTotal?: number;
	followingCount?: number;
}

export const useClientMyPageStats = ({
	bookings,
	reviews,
	payments = [],
	bookingsTotal,
	reviewsTotal,
	followingCount = 0,
}: UseClientMyPageStatsInput): ClientMyPageStats => {
	return useMemo(() => {
		const completed = bookings.filter((booking) => booking.bookingStatus === 'COMPLETED');
		const completedSpent = completed.reduce((sum, booking) => sum + bookingPrice(booking), 0);
		const paidPayments = payments.filter((payment) => payment.paymentStatus === 'COMPLETED');
		const paymentsSpent = paidPayments.reduce((sum, payment) => sum + Number(payment.paymentAmount ?? 0), 0);
		const totalSpent = paymentsSpent > 0 ? paymentsSpent : completedSpent;

		const reviewScores = reviews.map(reviewScore).filter((score): score is number => score != null);
		const avgRatingGiven = reviewScores.length
			? reviewScores.reduce((sum, score) => sum + score, 0) / reviewScores.length
			: null;

		const deviceIds = new Set(
			completed.map((booking) => booking.deviceData?._id ?? booking.deviceId).filter(Boolean),
		);

		return {
			repairsCount: bookingsTotal ?? bookings.length,
			completedCount: completed.length,
			reviewsCount: reviewsTotal ?? reviews.length,
			followingCount,
			savedCount: 0,
			avgRatingGiven,
			totalSpent,
			uniqueDevicesRepaired: deviceIds.size,
		};
	}, [bookings, reviews, payments, bookingsTotal, reviewsTotal, followingCount]);
};
