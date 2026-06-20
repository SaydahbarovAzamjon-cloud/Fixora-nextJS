import React, { useMemo } from 'react';
import Link from 'next/link';
import Moment from 'react-moment';
import { useTranslation } from 'next-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../../../apollo/user/query';
import { GET_BOOKING_PAYMENTS } from '../../../apollo/user/payment';
import { isDepositPaid, isFinalPaid } from '../../hooks/useBookingPayment';
import { formatKrw } from '../../utils/formatCurrency';
import type { Booking, BookingReview, Device, Payment } from '../../types/fixora/fixora';
import DepositPaymentCard from './DepositPaymentCard';
import FinalPaymentCard from './FinalPaymentCard';
import CancelBookingButton from './CancelBookingButton';
import BookingReviewSection from './BookingReviewSection';
import { FixoraButton } from '../ui';

const TIMELINE_STATUSES = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'] as const;

interface BookingDetailViewProps {
	booking: Booking;
	review?: BookingReview | null;
	payments?: Payment[];
	onRefresh?: () => void;
}

const BookingDetailView = ({ booking, review, payments: paymentsProp, onRefresh }: BookingDetailViewProps) => {
	const { t } = useTranslation('common');

	const { data: paymentsData, refetch: refetchPayments } = useQuery(GET_BOOKING_PAYMENTS, {
		variables: { bookingId: booking._id },
		fetchPolicy: 'network-only',
		skip: !!paymentsProp,
	});
	const payments = paymentsProp ?? ((paymentsData?.getBookingPayments ?? []) as Payment[]);

	const { data: technicianData } = useQuery(GET_USER, {
		variables: { userId: booking.technicianId },
		fetchPolicy: 'cache-first',
	});
	const technician = technicianData?.getUser;
	const technicianName = technician?.shopName || technician?.userFullName || technician?.userNickname || '';

	const device: Device | undefined = booking.deviceData;
	const title = device
		? `${t(`booking.device.categories.${device.deviceCategory}`)} ${device.deviceModel}`
		: booking.problemTitle;

	const price = booking.finalPrice ?? booking.estimatedPrice;
	const depositPaid = isDepositPaid(payments, booking.isPaid);
	const finalPaid = isFinalPaid(payments);
	const depositAmount = price ? Math.round(price / 2) : undefined;
	const finalAmount = price && depositAmount != null ? price - depositAmount : undefined;

	const currentTimelineIndex = TIMELINE_STATUSES.indexOf(
		booking.bookingStatus as (typeof TIMELINE_STATUSES)[number],
	);

	const messageHref = useMemo(
		() => `/messages?peerId=${booking.technicianId}&bookingId=${booking._id}`,
		[booking._id, booking.technicianId],
	);

	const handlePaymentRefresh = () => {
		refetchPayments();
		onRefresh?.();
	};

	return (
		<div className="fixora-booking-detail">
			<Link href="/mypage?tab=requests" className="fixora-booking-detail__back">
				<ArrowBackIcon fontSize="small" />
				{t('booking.detail.back')}
			</Link>

			<header className="fixora-booking-detail__header">
				<div className="fixora-booking-detail__header-main">
					{device?.deviceImage && (
						<img className="fixora-booking-detail__device-img" src={device.deviceImage} alt="" />
					)}
					<div>
						<h1>{title}</h1>
						<p>{booking.problemTitle}</p>
						<span className={`fixora-messages__status fixora-messages__status--${booking.bookingStatus.toLowerCase()}`}>
							{t(`booking.status.${booking.bookingStatus}`)}
						</span>
					</div>
				</div>
			</header>

			<div className="fixora-booking-detail__grid">
				<section className="fixora-booking-detail__panel">
					<h2>{t('booking.detail.info')}</h2>
					<dl className="fixora-booking-detail__meta">
						<div>
							<dt>{t('booking.detail.technician')}</dt>
							<dd>
								<Link href={`/technicians/${booking.technicianId}`}>{technicianName || '—'}</Link>
							</dd>
						</div>
						<div>
							<dt>{t('booking.detail.serviceType')}</dt>
							<dd>{t('booking.details.typeShopVisit')}</dd>
						</div>
						{booking.bookingDate && (
							<div>
								<dt>{t('booking.detail.date')}</dt>
								<dd>
									<Moment format="MMMM D, YYYY · h:mm A">{booking.bookingDate}</Moment>
								</dd>
							</div>
						)}
						{price != null && (
							<div>
								<dt>{t('booking.detail.price')}</dt>
								<dd>{formatKrw(price)}</dd>
							</div>
						)}
					</dl>

					{booking.problemDescription && (
						<div className="fixora-booking-detail__description">
							<h3>{t('booking.details.problemDescription')}</h3>
							<p>{booking.problemDescription}</p>
						</div>
					)}

					<div className="fixora-booking-detail__actions-row">
						<Link href={messageHref}>
							<FixoraButton variant="secondary">
								<ChatBubbleOutlineIcon fontSize="small" />
								{t('booking.detail.message')}
							</FixoraButton>
						</Link>
					</div>

					<CancelBookingButton
						bookingId={booking._id}
						bookingStatus={booking.bookingStatus}
						onCancelled={onRefresh}
					/>
				</section>

				<section className="fixora-booking-detail__panel">
					<h2>{t('booking.detail.timeline')}</h2>
					<ol className="fixora-booking-detail__timeline">
						{TIMELINE_STATUSES.map((status, index) => {
							const isDone = currentTimelineIndex >= index && booking.bookingStatus !== 'CANCELLED' && booking.bookingStatus !== 'REJECTED';
							const isCurrent = booking.bookingStatus === status;
							return (
								<li
									key={status}
									className={`fixora-booking-detail__timeline-step${isDone ? ' fixora-booking-detail__timeline-step--done' : ''}${isCurrent ? ' fixora-booking-detail__timeline-step--current' : ''}`}
								>
									<span>{t(`booking.status.${status}`)}</span>
								</li>
							);
						})}
					</ol>

					{booking.bookingStatus === 'IN_PROGRESS' && booking.progressUpdates && booking.progressUpdates.length > 0 && (
						<div className="fixora-booking-detail__progress">
							<h3>{t('booking.detail.progress')}</h3>
							<ul>
								{booking.progressUpdates.map((update, index) => (
									<li key={`${update.step}-${index}`}>
										<strong>{update.step}</strong>
										{update.note && <p>{update.note}</p>}
										<small>
											<Moment format="MMM D, YYYY · h:mm A">{update.timestamp}</Moment>
										</small>
									</li>
								))}
							</ul>
						</div>
					)}
				</section>
			</div>

			<section className="fixora-booking-detail__payments">
				<h2>{t('booking.detail.payments')}</h2>
				<div className="fixora-booking-detail__payment-summary">
					<div>
						<span>{t('payment.deposit.depositAmount')}</span>
						<strong>{depositPaid ? t('payment.alreadyPaid') : t('payment.depositDue')}</strong>
						{depositAmount != null && <em>{formatKrw(depositAmount)}</em>}
					</div>
					<div>
						<span>{t('payment.final.amount')}</span>
						<strong>{finalPaid ? t('payment.final.alreadyPaid') : t('payment.final.due')}</strong>
						{finalAmount != null && <em>{formatKrw(finalAmount)}</em>}
					</div>
				</div>

				<div className="fixora-booking-detail__payment-cards">
					{!depositPaid && booking.bookingStatus === 'ACCEPTED' && (
						<DepositPaymentCard
							bookingId={booking._id}
							problemTitle={booking.problemTitle}
							technicianName={technicianName}
							estimatedPrice={booking.estimatedPrice}
							bookingStatus={booking.bookingStatus}
							initialPaid={depositPaid}
							showSuccessLinks
							technicianId={booking.technicianId}
							onPaid={handlePaymentRefresh}
						/>
					)}

					{depositPaid && !finalPaid && (
						<FinalPaymentCard
							bookingId={booking._id}
							problemTitle={booking.problemTitle}
							technicianName={technicianName}
							estimatedPrice={booking.estimatedPrice}
							finalPrice={booking.finalPrice}
							bookingStatus={booking.bookingStatus}
							depositPaid={depositPaid}
							onPaid={handlePaymentRefresh}
						/>
					)}
				</div>
			</section>

			<BookingReviewSection
				bookingId={booking._id}
				bookingStatus={booking.bookingStatus}
				existingReview={review}
				onSubmitted={onRefresh}
			/>
		</div>
	);
};

export default BookingDetailView;
