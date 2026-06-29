import React, { useMemo } from 'react';
import Link from 'next/link';
import Moment from 'react-moment';
import { useTranslation } from 'next-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import StarIcon from '@mui/icons-material/Star';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import { useQuery } from '@apollo/client';
import { GET_DEVICE, GET_USER } from '../../../apollo/user/query';
import { GET_BOOKING_PAYMENTS } from '../../../apollo/user/payment';
import { isDepositPaid, isFinalPaid } from '../../hooks/useBookingPayment';
import { formatKrw } from '../../utils/formatCurrency';
import type { Booking, BookingReview, Device, Payment } from '../../types/fixora/fixora';
import DepositPaymentCard from './DepositPaymentCard';
import FinalPaymentCard from './FinalPaymentCard';
import CancelBookingButton from './CancelBookingButton';
import BookingReviewSection from './BookingReviewSection';
import BookingCustomerPhotos from './BookingCustomerPhotos';
import BookingDeviceCategoryVisual from './BookingDeviceCategoryVisual';
import { FixoraButton } from '../ui';
import { ownerMyPageHref } from '../../utils/clientMyPageRoute';
import { getBookingTypeLabelKey } from '../../utils/bookingServiceType';
import { formatBookingDisplayId } from '../../utils/deviceCategoryAsset';
import {
	BOOKING_PROGRESS_STEPS,
	getBookingProgressIndex,
	isBookingProgressStepCurrent,
	isBookingProgressStepDone,
} from '../../utils/bookingDetailProgress';
import { parseDeviceImagePaths, resolveDeviceImageUrl } from '../../utils/deviceImage';
import { resolveProfileImageUrl } from '../../utils/profileImage';
import {
	getTechnicianDisplayName,
	getTechnicianOwnerSubtitleLabel,
} from '../../utils/technicianProfileDisplay';
import { formatTechnicianWorkingHours } from '../../utils/workingHours';

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
	const technicianDisplayName = getTechnicianDisplayName(technician);
	const technicianOwnerLabel = getTechnicianOwnerSubtitleLabel(technician);

	const { data: deviceFallbackData } = useQuery(GET_DEVICE, {
		variables: { deviceId: booking.deviceId },
		fetchPolicy: 'cache-first',
		skip: !!booking.deviceData || !booking.deviceId,
	});
	const device: Device | undefined = (booking.deviceData as Device | undefined) ?? (deviceFallbackData?.getDevice as Device | undefined);
	const title = device
		? `${t(`booking.device.categories.${device.deviceCategory}`)} ${device.deviceModel}`
		: booking.problemTitle;
	const issueSummary = booking.problemTitle || device?.deviceIssue || '';
	const problemText =
		booking.problemDescription?.trim() || device?.deviceDescription?.trim() || device?.deviceIssue?.trim() || '';

	const customerPhotoUrls = useMemo(() => {
		return parseDeviceImagePaths(device?.deviceImage)
			.map((path) => resolveDeviceImageUrl(path))
			.filter((url): url is string => !!url);
	}, [device?.deviceImage]);

	const heroPhotoUrl = customerPhotoUrls[0] ?? null;
	const galleryPhotoUrls = useMemo(() => {
		if (customerPhotoUrls.length <= 1) return customerPhotoUrls;
		return customerPhotoUrls.slice(1);
	}, [customerPhotoUrls]);

	const price = booking.finalPrice ?? booking.estimatedPrice;
	const depositPaid = isDepositPaid(payments, booking.isPaid);
	const finalPaid = isFinalPaid(payments);
	const depositAmount = price ? Math.round(price / 2) : undefined;
	const progressIndex = getBookingProgressIndex(booking.bookingStatus, finalPaid);
	const isVerified = technician?.isVerified === true || technician?.badgeLevel === 'VERIFIED';
	const technicianAvatar = resolveProfileImageUrl(technician?.userProfileImage);
	const technicianLocation = technician?.userLocation?.trim() || '';
	const technicianHours = formatTechnicianWorkingHours(technician?.workingHours);

	const paymentStatusLabel = finalPaid
		? t('booking.detail.paymentStatusPaid')
		: depositPaid
			? t('booking.detail.paymentStatusPartial')
			: t('booking.detail.paymentStatusPending');

	const messageHref = useMemo(
		() => `/messages?peerId=${booking.technicianId}&bookingId=${booking._id}`,
		[booking._id, booking.technicianId],
	);

	const handlePaymentRefresh = () => {
		refetchPayments();
		onRefresh?.();
	};

	const detailRows = [
		{ label: t('booking.detail.serviceType'), value: t(getBookingTypeLabelKey(booking.bookingType)) },
		{
			label: t('booking.detail.estimatedCost'),
			value: price != null ? formatKrw(price) : '—',
		},
		{
			label: t('booking.detail.deposit'),
			value: depositPaid ? t('booking.detail.depositPaid') : t('payment.depositDue'),
			tone: depositPaid ? 'success' : 'warning',
		},
		{
			label: t('booking.detail.paymentStatus'),
			value: paymentStatusLabel,
			tone: finalPaid ? 'success' : depositPaid ? 'warning' : 'muted',
		},
		{
			label: t('booking.detail.shopVisitDate'),
			value: booking.bookingDate ? (
				<Moment format="MMM D, YYYY · h:mm A">{booking.bookingDate}</Moment>
			) : (
				t('booking.detail.shopVisitDatePending')
			),
		},
		{
			label: t('booking.detail.repairDuration'),
			value: t('booking.detail.repairDurationEstimate'),
		},
	];

	return (
		<div className="fixora-booking-detail">
			<Link href={ownerMyPageHref('activeRequests')} className="fixora-booking-detail__back">
				<ArrowBackIcon fontSize="small" />
				{t('booking.detail.back')}
			</Link>

			<section className="fixora-booking-detail__hero">
				<div className="fixora-booking-detail__hero-device">
					{heroPhotoUrl ? (
						<img src={heroPhotoUrl} alt="" className="fixora-booking-detail__hero-device-img" />
					) : (
						<BookingDeviceCategoryVisual category={device?.deviceCategory} size={80} />
					)}
				</div>
				<div className="fixora-booking-detail__hero-body">
					<div className="fixora-booking-detail__hero-title-row">
						<h1>{title}</h1>
						<span
							className={`fixora-booking-detail__status fixora-booking-detail__status--${booking.bookingStatus.toLowerCase()}`}
						>
							{t(`booking.status.${booking.bookingStatus}`)}
						</span>
					</div>
					{issueSummary && <p className="fixora-booking-detail__hero-subtitle">{issueSummary}</p>}
					<div className="fixora-booking-detail__hero-stats">
						<div>
							<span>{t('booking.detail.bookingId')}</span>
							<strong>{formatBookingDisplayId(booking._id)}</strong>
						</div>
						<div>
							<span>{t('booking.detail.created')}</span>
							<strong>
								<Moment format="MMM D, YYYY · h:mm A">{booking.createdAt}</Moment>
							</strong>
						</div>
						<div>
							<span>{t('booking.detail.serviceType')}</span>
							<strong>{t(getBookingTypeLabelKey(booking.bookingType))}</strong>
						</div>
						<div>
							<span>{t('booking.detail.estimatedCost')}</span>
							<strong>{price != null ? formatKrw(price) : '—'}</strong>
						</div>
					</div>
				</div>
			</section>

			<div className="fixora-booking-detail__row fixora-booking-detail__row--triple">
				<section className="fixora-booking-detail__card fixora-booking-detail__card--technician">
					<h2>{t('booking.detail.technician')}</h2>
					<div className="fixora-booking-detail__tech-profile">
						<img src={technicianAvatar} alt="" className="fixora-booking-detail__tech-avatar" />
						<div>
							<strong>{technicianDisplayName}</strong>
							{technicianOwnerLabel && (
								<span className="fixora-booking-detail__tech-owner">{technicianOwnerLabel}</span>
							)}
							<span className="fixora-booking-detail__tech-rating">
								<StarIcon fontSize="inherit" />
								{technician?.averageRating?.toFixed(1) ?? '—'}
								<em>({technician?.reviewCount ?? 0})</em>
							</span>
							{isVerified && (
								<span className="fixora-booking-detail__tech-verified">
									<VerifiedOutlinedIcon fontSize="inherit" />
									{t('booking.detail.verifiedTechnician')}
								</span>
							)}
						</div>
					</div>
					{(technicianLocation || technicianHours) && (
						<ul className="fixora-booking-detail__tech-meta">
							{technicianLocation && (
								<li>
									<PlaceOutlinedIcon fontSize="inherit" aria-hidden="true" />
									<span>
										<strong>{t('booking.detail.location')}</strong>
										{technicianLocation}
									</span>
								</li>
							)}
							{technicianHours && (
								<li>
									<ScheduleOutlinedIcon fontSize="inherit" aria-hidden="true" />
									<span>
										<strong>{t('booking.detail.workingHours')}</strong>
										{technicianHours}
									</span>
								</li>
							)}
						</ul>
					)}
					<div className="fixora-booking-detail__tech-actions">
						<Link href={messageHref} className="fixora-booking-detail__tech-link">
							<FixoraButton variant="outline" fullWidth>
								<ChatBubbleOutlineIcon fontSize="small" />
								{t('booking.detail.messageShort')}
							</FixoraButton>
						</Link>
						<Link href={`/technicians/${booking.technicianId}`} className="fixora-booking-detail__tech-link">
							<FixoraButton variant="primary" fullWidth>
								{t('booking.detail.viewProfile')}
							</FixoraButton>
						</Link>
					</div>
				</section>

				<section className="fixora-booking-detail__card fixora-booking-detail__card--progress">
					<h2>{t('booking.detail.statusProgress')}</h2>
					<ol className="fixora-booking-detail__stepper">
						{BOOKING_PROGRESS_STEPS.map((step, index) => {
							const done = isBookingProgressStepDone(index, progressIndex, finalPaid);
							const current = isBookingProgressStepCurrent(index, progressIndex, finalPaid);
							return (
								<li
									key={step}
									className={`fixora-booking-detail__step${done ? ' fixora-booking-detail__step--done' : ''}${current ? ' fixora-booking-detail__step--current' : ''}`}
								>
									<span className="fixora-booking-detail__step-dot" aria-hidden="true">
										{done ? <CheckCircleOutlineIcon fontSize="inherit" /> : null}
									</span>
									<div className="fixora-booking-detail__step-copy">
										<span>{t(`booking.detail.progressStep.${step}`)}</span>
										{index === 0 && (done || current) && (
											<small>
												<Moment format="MMM D, YYYY · h:mm A">{booking.createdAt}</Moment>
											</small>
										)}
									</div>
								</li>
							);
						})}
					</ol>
				</section>

				<section className="fixora-booking-detail__card fixora-booking-detail__card--device">
					<h2>{t('booking.detail.device')}</h2>
					<div className="fixora-booking-detail__device-showcase">
						<BookingCustomerPhotos imageUrls={galleryPhotoUrls} variant="embedded" />
					</div>
					{device && (
						<p className="fixora-booking-detail__device-caption">
							{t(`booking.device.categories.${device.deviceCategory}`)} · {device.deviceModel}
						</p>
					)}
				</section>
			</div>

			<div className="fixora-booking-detail__row fixora-booking-detail__row--double">
				<section className="fixora-booking-detail__card">
					<h2>{t('booking.detail.detailsTitle')}</h2>
					<dl className="fixora-booking-detail__details-list">
						{detailRows.map((row) => (
							<div key={row.label}>
								<dt>{row.label}</dt>
								<dd className={row.tone ? `fixora-booking-detail__details-value--${row.tone}` : undefined}>
									{row.value}
								</dd>
							</div>
						))}
					</dl>
				</section>

				<section className="fixora-booking-detail__card fixora-booking-detail__card--problem">
					<h2>{t('booking.details.problemDescription')}</h2>
					<BuildOutlinedIcon className="fixora-booking-detail__problem-watermark" aria-hidden="true" />
					<p>{problemText || t('booking.detail.noProblemDescription')}</p>
				</section>
			</div>

			{(!depositPaid && booking.bookingStatus === 'ACCEPTED') || (depositPaid && !finalPaid) ? (
				<section className="fixora-booking-detail__card fixora-booking-detail__card--payments">
					<h2>{t('booking.detail.payments')}</h2>
					<div className="fixora-booking-detail__payment-cards">
						{!depositPaid && booking.bookingStatus === 'ACCEPTED' && (
							<DepositPaymentCard
								bookingId={booking._id}
								problemTitle={booking.problemTitle}
								technicianName={technicianDisplayName}
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
								technicianName={technicianDisplayName}
								estimatedPrice={booking.estimatedPrice}
								finalPrice={booking.finalPrice}
								bookingStatus={booking.bookingStatus}
								depositPaid={depositPaid}
								onPaid={handlePaymentRefresh}
							/>
						)}
					</div>
				</section>
			) : null}

			<BookingReviewSection
				bookingId={booking._id}
				bookingStatus={booking.bookingStatus}
				existingReview={review}
				onSubmitted={onRefresh}
			/>

			<div className="fixora-booking-detail__footer-actions">
				<CancelBookingButton
					bookingId={booking._id}
					bookingStatus={booking.bookingStatus}
					onCancelled={onRefresh}
					layout="footer"
				/>
				<Link href={messageHref} className="fixora-booking-detail__footer-link">
					<FixoraButton variant="primary" fullWidth>
						<ChatBubbleOutlineIcon fontSize="small" />
						{t('booking.detail.message')}
					</FixoraButton>
				</Link>
			</div>
		</div>
	);
};

export default BookingDetailView;
