import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { CANCEL_BOOKING } from '../../../apollo/user/mutation';
import { GET_BOOKING } from '../../../apollo/user/query';
import { GET_MY_BOOKINGS } from '../../../apollo/user/profile';
import { FixoraButton } from '../ui';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import type { BookingStatus } from '../../types/fixora/fixora';

interface CancelBookingButtonProps {
	bookingId: string;
	bookingStatus: BookingStatus;
	onCancelled?: () => void;
}

const CANCELLABLE: BookingStatus[] = ['PENDING', 'ACCEPTED'];

const CancelBookingButton = ({ bookingId, bookingStatus, onCancelled }: CancelBookingButtonProps) => {
	const { t } = useTranslation('common');
	const [confirming, setConfirming] = useState(false);
	const [loading, setLoading] = useState(false);
	const [cancelBooking] = useMutation(CANCEL_BOOKING);

	if (!CANCELLABLE.includes(bookingStatus)) return null;

	const handleCancel = async () => {
		if (!confirming) {
			setConfirming(true);
			return;
		}
		setLoading(true);
		try {
			await cancelBooking({
				variables: { bookingId },
				refetchQueries: [
					{ query: GET_BOOKING, variables: { bookingId } },
					{ query: GET_MY_BOOKINGS, variables: { input: { page: 1, limit: 50, search: {} } } },
				],
				awaitRefetchQueries: true,
			});
			await sweetTopSmallSuccessAlert(t('booking.detail.cancelSuccess'), 1400);
			onCancelled?.();
		} catch (err) {
			await sweetErrorHandling(err);
		} finally {
			setLoading(false);
			setConfirming(false);
		}
	};

	return (
		<div className="fixora-booking-detail__cancel">
			{confirming ? (
				<>
					<p className="fixora-booking-detail__cancel-hint">{t('booking.detail.cancelConfirm')}</p>
					<div className="fixora-booking-detail__actions-row">
						<FixoraButton variant="secondary" disabled={loading} onClick={() => setConfirming(false)}>
							{t('booking.detail.cancelNo')}
						</FixoraButton>
						<FixoraButton variant="primary" disabled={loading} onClick={handleCancel}>
							{t('booking.detail.cancelYes')}
						</FixoraButton>
					</div>
				</>
			) : (
				<FixoraButton variant="secondary" onClick={handleCancel}>
					{t('booking.detail.cancel')}
				</FixoraButton>
			)}
		</div>
	);
};

export default CancelBookingButton;
