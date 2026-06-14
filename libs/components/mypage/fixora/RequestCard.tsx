import React from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import Moment from 'react-moment';
import { GET_DEVICE, GET_USER } from '../../../../apollo/user/query';
import { Booking } from '../../../types/fixora/fixora';

export interface RequestCardProps {
	booking: Booking;
}

const RequestCard = ({ booking }: RequestCardProps) => {
	const { t } = useTranslation('common');

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

	const title = device ? `${t(`booking.device.categories.${device.deviceCategory}`)} ${device.deviceModel}` : booking.problemTitle;

	return (
		<div className="fixora-mypage__request">
			{device?.deviceImage && <img className="fixora-mypage__request-image" src={device.deviceImage} alt="" />}
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
		</div>
	);
};

export default RequestCard;
