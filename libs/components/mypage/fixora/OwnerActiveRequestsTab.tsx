import React, { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { GET_USER } from '../../../../apollo/user/query';
import { Booking } from '../../../types/fixora/fixora';
import { resolveProfileImageUrl } from '../../../utils/profileImage';
import { formatKrw } from '../../../utils/formatCurrency';
import { dateLocale } from '../../../utils/i18nLocale';
import {
	ACTIVE_BOOKING_STATUSES,
	bookingPrice,
	bookingRefId,
	deviceLabel,
	isReadyForPickup,
} from './myPageHelpers';

interface OwnerActiveRequestsTabProps {
	bookings: Booking[];
}

const formatDate = (dateStr: string | undefined, locale?: string) => {
	if (!dateStr) return '';
	return new Date(dateStr).toLocaleDateString(dateLocale(locale), {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

interface ActiveRequestCardProps {
	booking: Booking;
}

const ActiveRequestCard = ({ booking }: ActiveRequestCardProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const readyForPickup = isReadyForPickup(booking);

	const { data } = useQuery(GET_USER, {
		skip: !booking.technicianId,
		variables: { userId: booking.technicianId },
		fetchPolicy: 'cache-first',
	});
	const technician = data?.getUser;
	const technicianName = technician?.shopName || technician?.userFullName || technician?.userNickname || '';

	const statusKey = useMemo(() => {
		if (readyForPickup) return 'readyForPickup';
		if (booking.bookingStatus === 'PENDING') return 'awaitingAssessment';
		if (booking.bookingStatus === 'ACCEPTED') return 'awaitingAssessment';
		if (booking.bookingStatus === 'IN_PROGRESS') {
			const lastNote = booking.progressUpdates?.[booking.progressUpdates.length - 1]?.note;
			return lastNote ? 'inProgressWithNote' : 'inProgress';
		}
		return booking.bookingStatus.toLowerCase();
	}, [booking, readyForPickup]);

	const statusNote = booking.progressUpdates?.[booking.progressUpdates.length - 1]?.note;
	const price = bookingPrice(booking);
	const showPrice = price > 0 && booking.bookingStatus !== 'PENDING';

	return (
		<article className={`fixora-mypage__active-card ${readyForPickup ? 'fixora-mypage__active-card--pickup' : ''}`}>
			<div className="fixora-mypage__active-card-body">
				<div className="fixora-mypage__active-card-left">
					<div className="fixora-mypage__active-avatar-wrap">
						<img
							className="fixora-mypage__active-avatar"
							src={resolveProfileImageUrl(technician?.userProfileImage)}
							alt=""
						/>
						<span
							className={`fixora-mypage__active-status-dot ${
								readyForPickup ? 'fixora-mypage__active-status-dot--ready' : ''
							}`}
						/>
					</div>
					<div className="fixora-mypage__active-info">
						<strong className="fixora-mypage__active-title">
							{deviceLabel(booking, t)} <span className="fixora-mypage__active-sep">·</span>{' '}
							<span className="fixora-mypage__active-service">{booking.problemTitle}</span>
						</strong>
						<span
							className={`fixora-mypage__active-badge fixora-mypage__active-badge--${readyForPickup ? 'ready' : statusKey}`}
						>
							{t(`mypage.activeStatus.${statusKey}`, statusNote ? { note: statusNote } : undefined)}
						</span>
					</div>
				</div>

				<div className="fixora-mypage__active-card-right">
					<div className="fixora-mypage__active-meta">
						<span>{bookingRefId(booking._id)}</span>
						<span>{formatDate(booking.bookingDate || booking.createdAt, router.locale)}</span>
					</div>
					{showPrice && <strong className="fixora-mypage__active-price">{formatKrw(price)}</strong>}
					<div className="fixora-mypage__active-actions">
						{readyForPickup ? (
							<Link
								href={`/mypage/bookings/${booking._id}`}
								className="fixora-mypage__active-btn fixora-mypage__active-btn--primary"
							>
								{t('mypage.confirmPickup')}
								<ChevronRightIcon fontSize="inherit" />
							</Link>
						) : (
							<Link
								href={`/mypage/bookings/${booking._id}`}
								className="fixora-mypage__active-btn fixora-mypage__active-btn--ghost"
							>
								{t('booking.detail.viewDetail')}
								<ChevronRightIcon fontSize="inherit" />
							</Link>
						)}
					</div>
				</div>
			</div>

			{readyForPickup && technicianName && (
				<div className="fixora-mypage__active-footer">
					<CheckCircleOutlineIcon fontSize="small" />
					<span>{t('mypage.pickupFooter', { technician: technicianName })}</span>
				</div>
			)}
		</article>
	);
};

const OwnerActiveRequestsTab = ({ bookings }: OwnerActiveRequestsTabProps) => {
	const { t } = useTranslation('common');

	const active = useMemo(
		() => bookings.filter((booking) => ACTIVE_BOOKING_STATUSES.includes(booking.bookingStatus)),
		[bookings],
	);

	return (
		<div className="fixora-mypage__panel">
			<div className="fixora-mypage__panel-head">
				<h2 className="fixora-mypage__panel-title">{t('mypage.activeRequests')}</h2>
				<Link href="/" className="fixora-mypage__new-request-btn">
					<BoltOutlinedIcon fontSize="small" />
					{t('mypage.newRequest')}
				</Link>
			</div>

			{!active.length ? (
				<p className="fixora-mypage__empty">{t('mypage.noRequests')}</p>
			) : (
				<div className="fixora-mypage__active-list">
					{active.map((booking) => (
						<ActiveRequestCard key={booking._id} booking={booking} />
					))}
				</div>
			)}
		</div>
	);
};

export default OwnerActiveRequestsTab;
