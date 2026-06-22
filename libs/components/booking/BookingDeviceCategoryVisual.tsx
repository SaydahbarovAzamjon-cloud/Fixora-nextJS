import React from 'react';
import DeviceIcon from '../technician/deviceIcon';

interface BookingDeviceCategoryVisualProps {
	category?: string | null;
	className?: string;
	size?: number;
}

const BookingDeviceCategoryVisual = ({
	category,
	className = '',
	size = 72,
}: BookingDeviceCategoryVisualProps) => (
	<div className={`fixora-booking-detail__device-icon ${className}`.trim()} aria-hidden="true">
		<DeviceIcon deviceType={category} size={size} strokeWidth={1.35} />
	</div>
);

export default BookingDeviceCategoryVisual;
