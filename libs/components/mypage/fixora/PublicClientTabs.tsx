import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import StarIcon from '@mui/icons-material/Star';
import { GET_BOOKING_REVIEW, GET_USER } from '../../../../apollo/user/query';
import { Booking } from '../../../types/fixora/fixora';
import { resolveProfileImageUrl } from '../../../utils/profileImage';
import { formatKrw } from '../../../utils/formatCurrency';
import { dateLocale } from '../../../utils/i18nLocale';
import { getPrimaryDeviceImageUrl } from '../../../utils/deviceImage';

const averageReviewScore = (review?: any) => {
	if (!review) return null;
	const scores = [review.repairQuality, review.repairSpeed, review.communication].filter((value) => typeof value === 'number');
	if (!scores.length) return null;
	return scores.reduce((sum, value) => sum + value, 0) / scores.length;
};

const bookingPrice = (booking: Booking) => Number(booking.finalPrice ?? booking.estimatedPrice ?? 0);

const formatProfileDate = (dateStr: string | undefined, locale?: string) => {
	if (!dateStr) return '';
	return new Date(dateStr).toLocaleDateString(dateLocale(locale), { month: 'short', day: 'numeric', year: 'numeric' });
};

const deviceTitle = (booking: Booking, t: (key: string, options?: any) => string) => {
	const device = booking.deviceData;
	if (!device) return booking.problemTitle;
	const category = device.deviceCategory ? t(`booking.device.categories.${device.deviceCategory}`, device.deviceCategory) : '';
	return `${category} ${device.deviceModel ?? ''}`.trim() || booking.problemTitle;
};

interface RepairHistoryTabProps {
	bookings: Booking[];
}

const TechnicianName = ({ technicianId }: { technicianId?: string }) => {
	const { t } = useTranslation('common');
	const { data } = useQuery(GET_USER, {
		skip: !technicianId,
		variables: { userId: technicianId },
		fetchPolicy: 'cache-first',
	});
	const technician = data?.getUser;
	return <>{technician?.shopName || technician?.userFullName || technician?.userNickname || t('clientProfile.unknownTechnician')}</>;
};

export const ClientRepairHistoryTab = ({ bookings }: RepairHistoryTabProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const completed = bookings.filter((booking) => booking.bookingStatus === 'COMPLETED');

	if (!completed.length) {
		return <p className="fixora-mypage__empty">{t('clientProfile.emptyRepairHistory')}</p>;
	}

	return (
		<div className="fixora-mypage__requests">
			<section className="fixora-mypage__section">
				<h3 className="fixora-mypage__section-title">
					{t('clientProfile.repairHistoryTitle', { count: completed.length })}
				</h3>
				<div className="fixora-mypage__request-list">
					{completed.map((booking) => {
						const deviceImageUrl = getPrimaryDeviceImageUrl(booking.deviceData?.deviceImage);
						return (
							<div key={booking._id} className="fixora-mypage__request">
							<div className="fixora-mypage__request-main">
								{deviceImageUrl && <img className="fixora-mypage__request-image" src={deviceImageUrl} alt="" />}
								<div className="fixora-mypage__request-info">
									<strong>{deviceTitle(booking, t)}</strong>
									<span>{booking.problemTitle}</span>
								</div>
								<div className="fixora-mypage__request-meta">
									<div>
										<dt>{t('clientProfile.serviceCategory')}</dt>
										<dd>{booking.problemTitle}</dd>
									</div>
									<div>
										<dt>{t('clientProfile.technicianInvolved')}</dt>
										<dd><TechnicianName technicianId={booking.technicianId} /></dd>
									</div>
									<div>
										<dt>{t('clientProfile.completedDate')}</dt>
										<dd>{formatProfileDate(booking.completedAt || booking.bookingDate || booking.createdAt, router.locale)}</dd>
									</div>
								</div>
								<span className="fixora-mypage__request-view">{formatKrw(bookingPrice(booking))}</span>
							</div>
						</div>
						);
					})}
				</div>
			</section>
		</div>
	);
};

export const ClientSavedTechniciansTab = () => {
	const { t } = useTranslation('common');
	return <p className="fixora-mypage__empty">{t('clientProfile.savedUnavailable')}</p>;
};

interface ReviewItemProps {
	booking: Booking;
}

const ClientReviewItem = ({ booking }: ReviewItemProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const { data } = useQuery(GET_BOOKING_REVIEW, {
		skip: booking.bookingStatus !== 'COMPLETED',
		variables: { bookingId: booking._id },
		fetchPolicy: 'cache-first',
	});
	const { data: technicianData } = useQuery(GET_USER, {
		skip: !booking.technicianId,
		variables: { userId: booking.technicianId },
		fetchPolicy: 'cache-first',
	});
	const review = data?.getBookingReview;
	const technician = technicianData?.getUser;
	const technicianName = technician?.shopName || technician?.userFullName || technician?.userNickname || '';
	const rating = averageReviewScore(review);

	if (!review) return null;

	return (
		<div className="fixora-mypage__request">
			<div className="fixora-mypage__request-main">
				<img className="fixora-mypage__following-avatar" src={resolveProfileImageUrl(technician?.userProfileImage)} alt="" />
				<div className="fixora-mypage__request-info">
					<strong>{technicianName || t('clientProfile.unknownTechnician')}</strong>
					<span>{deviceTitle(booking, t)} · {booking.problemTitle}</span>
					<span>{review.reviewContent || t('clientProfile.noReviewComment')}</span>
				</div>
				<div className="fixora-mypage__request-meta">
					<div>
						<dt>{t('clientProfile.rating')}</dt>
						<dd className="fixora-mypage__following-rating">
							<StarIcon fontSize="inherit" />
							{rating ? rating.toFixed(1) : '—'}
						</dd>
					</div>
					<div>
						<dt>{t('clientProfile.completedDate')}</dt>
						<dd>{formatProfileDate(booking.completedAt || review.createdAt, router.locale)}</dd>
					</div>
				</div>
			</div>
		</div>
	);
};

interface ReviewsTabProps {
	bookings: Booking[];
}

export const ClientReviewsTab = ({ bookings }: ReviewsTabProps) => {
	const { t } = useTranslation('common');
	const completed = bookings.filter((booking) => booking.bookingStatus === 'COMPLETED');

	if (!completed.length) {
		return <p className="fixora-mypage__empty">{t('clientProfile.emptyReviews')}</p>;
	}

	return (
		<div className="fixora-mypage__request-list">
			{completed.map((booking) => (
				<ClientReviewItem
					key={booking._id}
					booking={booking}
				/>
			))}
		</div>
	);
};
