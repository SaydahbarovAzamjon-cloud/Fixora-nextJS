import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import Moment from 'react-moment';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import EastIcon from '@mui/icons-material/East';
import { GET_DEVICE, GET_USER } from '../../../../apollo/user/query';
import { Booking } from '../../../types/fixora/fixora';
import DepositPaymentCard from '../../booking/DepositPaymentCard';
import { getPrimaryDeviceImageUrl } from '../../../utils/deviceImage';

export interface RequestCardProps {
	booking: Booking;
	onPaymentComplete?: () => void;
}

const RequestCard = ({ booking, onPaymentComplete }: RequestCardProps) => {
	const { t } = useTranslation('common');
	const [showPayment, setShowPayment] = useState(false);
	const [paidLocally, setPaidLocally] = useState(false);

	const { data: deviceData } = useQuery(GET_DEVICE, {
		variables: { deviceId: booking.deviceId },
		fetchPolicy: 'cache-first',
	});
	const device = deviceData?.getDevice;

	const { data: technicianData } = useQuery(GET_USER, {
		variables: { userId: booking.technicianId },
		fetchPolicy: 'cache-first',
	});
	const technician = technicianData?.getUser;
	const technicianName = technician?.shopName || technician?.userFullName || technician?.userNickname || '';
	const deviceImageUrl = getPrimaryDeviceImageUrl(device?.deviceImage);

	const title = device ? `${t(`booking.device.categories.${device.deviceCategory}`)} ${device.deviceModel}` : booking.problemTitle;

	const depositPaid = paidLocally || !!booking.isPaid;
	const awaitingApproval = booking.bookingStatus === 'PENDING' && !depositPaid;
	const needsDeposit = booking.bookingStatus === 'ACCEPTED' && !depositPaid;

	return (
		<div className="fixora-mypage__request">
			<Link href={`/mypage/bookings/${booking._id}`} className="fixora-mypage__request-main">
				{deviceImageUrl && <img className="fixora-mypage__request-image" src={deviceImageUrl} alt="" />}
				<div className="fixora-mypage__request-info">
					<strong>{title}</strong>
					<span>{booking.problemTitle}</span>
				</div>
				<div className="fixora-mypage__request-meta">
					<div>
						<dt>{t('mypage.requestStatus')}</dt>
						<dd>
							<span className={`fixora-messages__status fixora-messages__status--${booking.bookingStatus.toLowerCase()}`}>
								{t(`booking.status.${booking.bookingStatus}`)}
							</span>
						</dd>
					</div>
					<div>
						<dt>{t('mypage.requestDate')}</dt>
						<dd>
							{booking.bookingDate ? <Moment format="MMM D, YYYY">{booking.bookingDate}</Moment> : <Moment format="MMM D, YYYY">{booking.createdAt}</Moment>}
						</dd>
					</div>
					<div>
						<dt>{t('mypage.requestTechnician')}</dt>
						<dd>{technicianName}</dd>
					</div>
				</div>
				<span className="fixora-mypage__request-view">
					{t('booking.detail.viewDetail')} <EastIcon fontSize="inherit" />
				</span>
			</Link>

			<div className="fixora-mypage__request-payment">
				{depositPaid ? (
					<div className="fixora-deposit-payment__badge-wrap fixora-deposit-payment__badge-wrap--compact">
						<span className="fixora-deposit-payment__badge fixora-deposit-payment__badge--paid">{t('payment.alreadyPaid')}</span>
					</div>
				) : awaitingApproval ? (
					<div className="fixora-mypage__request-waiting">
						<HourglassTopOutlinedIcon fontSize="small" />
						<span>{t('payment.awaitingApproval.short')}</span>
					</div>
				) : needsDeposit ? (
					<>
						<span className="fixora-deposit-payment__badge fixora-deposit-payment__badge--pending">{t('payment.depositDue')}</span>
						{!showPayment ? (
							<button type="button" className="fixora-mypage__request-pay-btn" onClick={() => setShowPayment(true)}>
								{t('payment.payDeposit')}
							</button>
						) : (
							<DepositPaymentCard
								bookingId={booking._id}
								problemTitle={booking.problemTitle}
								technicianName={technicianName}
								estimatedPrice={booking.estimatedPrice}
								bookingStatus={booking.bookingStatus}
								compact
								onPaid={() => {
									setPaidLocally(true);
									setShowPayment(false);
									onPaymentComplete?.();
								}}
							/>
						)}
					</>
				) : null}
			</div>
		</div>
	);
};

export default RequestCard;
