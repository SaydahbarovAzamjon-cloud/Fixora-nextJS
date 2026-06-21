import React, { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import { GET_BOOKING_REVIEW, GET_USER } from '../../../../apollo/user/query';
import { Booking } from '../../../types/fixora/fixora';
import { resolveProfileImageUrl } from '../../../utils/profileImage';
import { formatKrw } from '../../../utils/formatCurrency';
import { dateLocale } from '../../../utils/i18nLocale';
import { ClientMyPageStats } from '../../../hooks/useClientMyPageStats';
import StarRow from './StarRow';
import { averageReviewScore, bookingPrice, deviceLabel } from './myPageHelpers';

interface OwnerRepairHistoryTabProps {
	bookings: Booking[];
	stats: ClientMyPageStats;
}

const formatDate = (dateStr: string | undefined, locale?: string) => {
	if (!dateStr) return '';
	return new Date(dateStr).toLocaleDateString(dateLocale(locale), {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

interface HistoryRowProps {
	booking: Booking;
}

const HistoryRow = ({ booking }: HistoryRowProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();

	const { data: technicianData } = useQuery(GET_USER, {
		skip: !booking.technicianId,
		variables: { userId: booking.technicianId },
		fetchPolicy: 'cache-first',
	});
	const { data: reviewData } = useQuery(GET_BOOKING_REVIEW, {
		skip: booking.bookingStatus !== 'COMPLETED',
		variables: { bookingId: booking._id },
		fetchPolicy: 'cache-first',
	});

	const technician = technicianData?.getUser;
	const technicianName = technician?.shopName || technician?.userFullName || technician?.userNickname || '';
	const rating = averageReviewScore(reviewData?.getBookingReview) ?? 0;
	const price = bookingPrice(booking);

	return (
		<article className="fixora-mypage__history-row">
			<img
				className="fixora-mypage__history-avatar"
				src={resolveProfileImageUrl(technician?.userProfileImage)}
				alt=""
			/>
			<div className="fixora-mypage__history-main">
				<strong className="fixora-mypage__history-title">
					{deviceLabel(booking, t)} <span className="fixora-mypage__active-sep">·</span>{' '}
					<span className="fixora-mypage__active-service">{booking.problemTitle}</span>
				</strong>
				<span className="fixora-mypage__history-sub">
					{technicianName} · {formatDate(booking.completedAt || booking.bookingDate || booking.createdAt, router.locale)}
				</span>
				{rating > 0 && <StarRow rating={rating} />}
			</div>
			<div className="fixora-mypage__history-side">
				<strong>{formatKrw(price)}</strong>
				<Link href={`/mypage/bookings/${booking._id}`} className="fixora-mypage__history-receipt">
					{t('mypage.receipt')}
				</Link>
			</div>
		</article>
	);
};

const OwnerRepairHistoryTab = ({ bookings, stats }: OwnerRepairHistoryTabProps) => {
	const { t } = useTranslation('common');

	const completed = useMemo(
		() => bookings.filter((booking) => booking.bookingStatus === 'COMPLETED'),
		[bookings],
	);

	const kpis = [
		{
			icon: <BuildOutlinedIcon fontSize="small" />,
			value: stats.repairsCount,
			label: t('mypage.historyKpi.totalRepairs'),
			tone: 'orange',
		},
		{
			icon: <CreditCardOutlinedIcon fontSize="small" />,
			value: formatKrw(stats.totalSpent),
			label: t('mypage.historyKpi.totalSpent'),
			tone: 'green',
		},
		{
			icon: <StarOutlineOutlinedIcon fontSize="small" />,
			value: stats.avgRatingGiven != null ? `${stats.avgRatingGiven.toFixed(1)}★` : '—',
			label: t('mypage.historyKpi.avgRatingGiven'),
			tone: 'orange',
		},
		{
			icon: <DevicesOutlinedIcon fontSize="small" />,
			value: stats.uniqueDevicesRepaired,
			label: t('mypage.historyKpi.devicesRepaired'),
			tone: 'blue',
		},
	];

	return (
		<div className="fixora-mypage__panel">
			<h2 className="fixora-mypage__panel-title">
				{t('mypage.repairHistoryTitle', { count: completed.length })}
			</h2>

			<div className="fixora-mypage__history-kpis">
				{kpis.map((kpi) => (
					<div key={kpi.label} className={`fixora-mypage__history-kpi fixora-mypage__history-kpi--${kpi.tone}`}>
						<span className="fixora-mypage__history-kpi-icon">{kpi.icon}</span>
						<strong>{kpi.value}</strong>
						<span>{kpi.label}</span>
					</div>
				))}
			</div>

			{!completed.length ? (
				<p className="fixora-mypage__empty">{t('mypage.emptyRepairHistory')}</p>
			) : (
				<div className="fixora-mypage__history-list">
					{completed.map((booking) => (
						<HistoryRow key={booking._id} booking={booking} />
					))}
				</div>
			)}
		</div>
	);
};

export default OwnerRepairHistoryTab;
