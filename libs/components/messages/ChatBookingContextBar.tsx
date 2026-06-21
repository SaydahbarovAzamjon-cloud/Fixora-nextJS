import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Booking, Device } from '../../types/fixora/fixora';
import { bookingRefId } from '../../utils/messageHelpers';
import { deviceLabel } from '../mypage/fixora/myPageHelpers';

interface ChatBookingContextBarProps {
	booking: Booking;
	device?: Device | null;
}

const ChatBookingContextBar = ({ booking, device }: ChatBookingContextBarProps) => {
	const { t } = useTranslation('common');
	const ref = bookingRefId(booking._id);
	const deviceName = device
		? deviceLabel({ ...booking, deviceData: device }, t)
		: booking.problemTitle;
	const summary = `${ref} · ${deviceName} – ${booking.problemTitle}`;

	return (
		<div className="fixora-messages__context-bar">
			<BuildOutlinedIcon className="fixora-messages__context-bar-icon" fontSize="small" />
			<span className="fixora-messages__context-bar-text">{summary}</span>
			<span className={`fixora-messages__status fixora-messages__status--${booking.bookingStatus.toLowerCase()}`}>
				{t(`booking.status.${booking.bookingStatus}`)}
			</span>
			<Link href={`/mypage/bookings/${booking._id}`} className="fixora-messages__context-bar-link">
				{t('messages.viewDetails')}
				<ChevronRightIcon fontSize="small" />
			</Link>
		</div>
	);
};

export default ChatBookingContextBar;
