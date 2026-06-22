import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import CloseIcon from '@mui/icons-material/Close';
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
	layout?: 'inline' | 'footer';
}

const CANCELLABLE: BookingStatus[] = ['PENDING', 'ACCEPTED'];

const CancelBookingButton = ({
	bookingId,
	bookingStatus,
	onCancelled,
	layout = 'inline',
}: CancelBookingButtonProps) => {
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

	if (layout === 'footer') {
		return (
			<div className="fixora-booking-detail__cancel-footer">
				{confirming && (
					<p className="fixora-booking-detail__cancel-hint">{t('booking.detail.cancelConfirm')}</p>
				)}
				{confirming ? (
					<div className="fixora-booking-detail__cancel-confirm-row">
						<FixoraButton variant="outline" fullWidth disabled={loading} onClick={() => setConfirming(false)}>
							{t('booking.detail.cancelNo')}
						</FixoraButton>
						<FixoraButton variant="primary" fullWidth disabled={loading} onClick={handleCancel}>
							{t('booking.detail.cancelYes')}
						</FixoraButton>
					</div>
				) : (
					<FixoraButton variant="outline" fullWidth onClick={handleCancel}>
						<CloseIcon fontSize="small" />
						{t('booking.detail.cancel')}
					</FixoraButton>
				)}
			</div>
		);
	}

	return (
		<div className="fixora-booking-detail__cancel">
			{confirming ? (
				<>
					<p className="fixora-booking-detail__cancel-hint">{t('booking.detail.cancelConfirm')}</p>
					<FixoraButton variant="outline" disabled={loading} onClick={() => setConfirming(false)}>
						{t('booking.detail.cancelNo')}
					</FixoraButton>
					<FixoraButton variant="primary" disabled={loading} onClick={handleCancel}>
						{t('booking.detail.cancelYes')}
					</FixoraButton>
				</>
			) : (
				<FixoraButton variant="outline" onClick={handleCancel}>
					{t('booking.detail.cancel')}
				</FixoraButton>
			)}
		</div>
	);
};

export default CancelBookingButton;
