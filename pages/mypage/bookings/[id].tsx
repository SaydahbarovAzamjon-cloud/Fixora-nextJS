import React, { useEffect } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery, useReactiveVar } from '@apollo/client';
import withLayoutFull from '../../../libs/components/layout/LayoutFull';
import BookingDetailView from '../../../libs/components/booking/BookingDetailView';
import { GET_BOOKING, GET_BOOKING_REVIEW } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { isCustomerUser, isTechnicianUser } from '../../../libs/utils/userRole';
import type { Booking, BookingReview } from '../../../libs/types/fixora/fixora';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const BookingDetailPage: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const isCustomer = isCustomerUser(user);
	const isTechnician = isTechnicianUser(user);
	const bookingId = router.query.id as string | undefined;

	useEffect(() => {
		if (!user?._id) {
			router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`).then();
		}
	}, [router, user?._id]);

	const { data, loading, error, refetch } = useQuery(GET_BOOKING, {
		skip: !bookingId || !user?._id || !isCustomer,
		variables: { bookingId: bookingId ?? '' },
		fetchPolicy: 'network-only',
	});

	const { data: reviewData, refetch: refetchReview } = useQuery(GET_BOOKING_REVIEW, {
		skip: !bookingId || !user?._id || !isCustomer,
		variables: { bookingId: bookingId ?? '' },
		fetchPolicy: 'network-only',
	});

	const booking = data?.getBooking as Booking | undefined;
	const review = (reviewData?.getBookingReview ?? null) as BookingReview | null;

	const handleRefresh = () => {
		refetch();
		refetchReview();
	};

	if (!user?._id) {
		return null;
	}

	if (isTechnician) {
		return (
			<div className="fixora-booking-detail-page">
				<div className="container">
					<div className="fixora-mypage__role-notice">
						<h1>{t('mypage.technicianRedirect.title')}</h1>
						<p>{t('mypage.technicianRedirect.message')}</p>
						<Link href="/technician/dashboard" className="fixora-tech-profile__book-btn">
							{t('mypage.technicianRedirect.cta')}
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="fixora-booking-detail-page">
			<div className="container">
				{loading && <p className="fixora-booking-detail__loading">{t('booking.detail.loading')}</p>}

				{!loading && (error || !booking) && (
					<div className="fixora-booking-detail__empty">
						<h1>{t('booking.detail.notFound')}</h1>
						<p>{t('booking.detail.notFoundHint')}</p>
					</div>
				)}

				{!loading && booking && booking.userId !== user._id && (
					<div className="fixora-booking-detail__empty">
						<h1>{t('booking.detail.notFound')}</h1>
					</div>
				)}

				{!loading && booking && booking.userId === user._id && (
					<BookingDetailView booking={booking} review={review} onRefresh={handleRefresh} />
				)}
			</div>
		</div>
	);
};

export default withLayoutFull(BookingDetailPage);
