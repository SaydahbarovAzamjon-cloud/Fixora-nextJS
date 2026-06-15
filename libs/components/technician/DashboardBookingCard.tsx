import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DEVICE, GET_USER } from '../../../apollo/user/query';

interface DashboardBookingCardProps {
	booking: any;
	technicianLocation?: string;
	variant: 'request' | 'job';
}

const DashboardBookingCard: React.FC<DashboardBookingCardProps> = ({
	booking,
	technicianLocation,
	variant,
}) => {
	const { data: deviceData } = useQuery(GET_DEVICE, {
		skip: !booking?.deviceId,
		variables: { deviceId: booking?.deviceId },
		fetchPolicy: 'cache-first',
	});

	const { data: customerData } = useQuery(GET_USER, {
		skip: !booking?.userId,
		variables: { userId: booking?.userId },
		fetchPolicy: 'cache-first',
	});

	const device = useMemo(() => deviceData?.getDevice ?? null, [deviceData]);
	const customer = useMemo(() => customerData?.getUser ?? null, [customerData]);

	if (variant === 'request') {
		return (
			<div className="fixora-request-item">
				<div className="fixora-request-item__device">
					📱 {device?.deviceBrand} {device?.deviceModel || 'Device'}
				</div>
				<div className="fixora-request-item__problem">
					{booking?.problemTitle ?? 'Repair request'}
				</div>
				<div className="fixora-request-item__customer">
					{customer?.userFullName || customer?.userNickname || 'Customer'}
				</div>
				<div className="fixora-request-item__location">
					📍 {technicianLocation || '—'}
				</div>
				<div className="fixora-request-item__price">
					₩{booking?.estimatedPrice ?? booking?.finalPrice ?? 0}
				</div>
			</div>
		);
	}

	return (
		<div className="fixora-job-item">
			<div className="fixora-job-item__status">
				{booking?.bookingStatus === 'CONFIRMED' ? '⏳ Confirmed' : '⚙️ In Progress'}
			</div>
			<div className="fixora-job-item__problem">
				{booking?.problemTitle ?? 'Repair'}
			</div>
			<div className="fixora-job-item__customer">
				{customer?.userFullName || customer?.userNickname || 'Customer'}
			</div>
			<div className="fixora-job-item__date">
				📅 {new Date(booking?.bookingDate).toLocaleDateString('en-US')}
			</div>
			<div className="fixora-job-item__time">
				🕐{' '}
				{new Date(booking?.bookingDate).toLocaleTimeString('en-US', {
					hour: '2-digit',
					minute: '2-digit',
				})}
			</div>
		</div>
	);
};

export default DashboardBookingCard;
