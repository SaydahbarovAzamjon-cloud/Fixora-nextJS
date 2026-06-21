import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { GET_MY_REVIEWS } from '../../../../apollo/user/profile';
import { GET_USER } from '../../../../apollo/user/query';
import { Booking, BookingReview } from '../../../types/fixora/fixora';
import { resolveProfileImageUrl } from '../../../utils/profileImage';
import { dateLocale } from '../../../utils/i18nLocale';
import StarRow from './StarRow';
import { averageReviewScore } from './myPageHelpers';

const formatDate = (dateStr: string | undefined, locale?: string) => {
	if (!dateStr) return '';
	return new Date(dateStr).toLocaleDateString(dateLocale(locale), {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

const deviceLine = (
	review: BookingReview,
	booking: Booking | undefined,
	t: (key: string, fallback?: string) => string,
) => {
	const device = review.deviceData ?? booking?.deviceData;
	if (!device && !booking?.problemTitle) return '';
	const category = device?.deviceCategory
		? t(`booking.device.categories.${device.deviceCategory}`, device.deviceCategory)
		: '';
	const deviceText = `${category} ${device?.deviceModel ?? ''}`.trim();
	const service = booking?.problemTitle ?? '';
	if (deviceText && service) return `${deviceText} · ${service}`;
	return deviceText || service;
};

interface ReviewCardProps {
	review: BookingReview;
	booking?: Booking;
}

const ReviewCard = ({ review, booking }: ReviewCardProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();

	const { data } = useQuery(GET_USER, {
		skip: !review.technicianId,
		variables: { userId: review.technicianId },
		fetchPolicy: 'cache-first',
	});
	const technician = data?.getUser;
	const technicianName = technician?.shopName || technician?.userFullName || technician?.userNickname || '';
	const rating = averageReviewScore(review) ?? 0;
	const deviceText = deviceLine(review, booking, t);

	return (
		<article className="fixora-mypage__review-card">
			<div className="fixora-mypage__review-head">
				<img
					className="fixora-mypage__review-avatar"
					src={resolveProfileImageUrl(technician?.userProfileImage)}
					alt=""
				/>
				<div className="fixora-mypage__review-meta">
					<strong>{technicianName || t('clientProfile.unknownTechnician')}</strong>
					<StarRow rating={rating} />
					{deviceText && <span className="fixora-mypage__review-device">{deviceText}</span>}
				</div>
				<time className="fixora-mypage__review-date">{formatDate(review.createdAt, router.locale)}</time>
			</div>
			<p className="fixora-mypage__review-body">{review.reviewContent || t('clientProfile.noReviewComment')}</p>
		</article>
	);
};

interface OwnerReviewsTabProps {
	bookings: Booking[];
}

const OwnerReviewsTab = ({ bookings }: OwnerReviewsTabProps) => {
	const { t } = useTranslation('common');

	const { data } = useQuery(GET_MY_REVIEWS, {
		variables: { input: { page: 1, limit: 50, search: {} } },
		fetchPolicy: 'network-only',
	});

	const reviews: BookingReview[] = data?.getMyReviews?.list ?? [];
	const bookingMap = useMemo(() => new Map(bookings.map((booking) => [booking._id, booking])), [bookings]);

	return (
		<div className="fixora-mypage__panel">
			<h2 className="fixora-mypage__panel-title">{t('mypage.tabs.reviews')}</h2>
			{!reviews.length ? (
				<p className="fixora-mypage__empty">{t('mypage.emptyReviews')}</p>
			) : (
				<div className="fixora-mypage__review-list">
					{reviews.map((review) => (
						<ReviewCard key={review._id} review={review} booking={bookingMap.get(review.bookingId)} />
					))}
				</div>
			)}
		</div>
	);
};

export default OwnerReviewsTab;
