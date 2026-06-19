import { useCallback, useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { CONFIRM_PAYMENT, GET_BOOKING_PAYMENTS, INITIATE_PAYMENT } from '../../apollo/user/payment';
import { GET_MY_BOOKINGS, GET_MY_PAYMENTS } from '../../apollo/user/profile';
import { sweetErrorHandling, sweetMixinErrorAlert } from '../sweetAlert';
import type { BookingStatus, Payment, PaymentMethod } from '../types/fixora/fixora';

const MOCK_TRANSACTION_IDS: Record<'KAKAOPAY' | 'CARD', string> = {
	KAKAOPAY: 'mock-kakaopay',
	CARD: 'mock-card',
};

const MY_BOOKINGS_REFETCH = {
	query: GET_MY_BOOKINGS,
	variables: { input: { page: 1, limit: 50, search: {} } },
};

const TECHNICIAN_PAYMENTS_REFETCH = {
	query: GET_MY_PAYMENTS,
	variables: { input: { page: 1, limit: 200, search: {} } },
};

export function getDepositPayment(payments: Payment[] | undefined): Payment | undefined {
	return payments?.find((p) => p.paymentType === 'DEPOSIT');
}

export function isDepositPaid(payments: Payment[] | undefined, isPaid?: boolean): boolean {
	const deposit = getDepositPayment(payments);
	return deposit?.paymentStatus === 'COMPLETED' || !!isPaid;
}

export function useDepositPayment() {
	const [loading, setLoading] = useState(false);
	const [initiatePayment] = useMutation(INITIATE_PAYMENT);
	const [confirmPayment] = useMutation(CONFIRM_PAYMENT);
	const [fetchPayments] = useLazyQuery(GET_BOOKING_PAYMENTS, { fetchPolicy: 'network-only' });

	const loadPayments = useCallback(
		async (bookingId: string): Promise<Payment[]> => {
			const result = await fetchPayments({ variables: { bookingId } });
			return (result.data?.getBookingPayments ?? []) as Payment[];
		},
		[fetchPayments],
	);

	const payDeposit = useCallback(
		async (
			bookingId: string,
			paymentMethod: PaymentMethod = 'KAKAOPAY',
			bookingStatus?: BookingStatus,
		): Promise<Payment | null> => {
			if (bookingStatus && bookingStatus !== 'ACCEPTED') {
				await sweetMixinErrorAlert(
					bookingStatus === 'PENDING'
						? 'Technician has not approved your request yet. You can pay the deposit after acceptance.'
						: 'This booking is not ready for deposit payment.',
				);
				return null;
			}

			setLoading(true);
			try {
				const existing = await loadPayments(bookingId);
				const completedDeposit = existing.find(
					(p) => p.paymentType === 'DEPOSIT' && p.paymentStatus === 'COMPLETED',
				);
				if (completedDeposit) return completedDeposit;

				let paymentId = existing.find(
					(p) => p.paymentType === 'DEPOSIT' && p.paymentStatus === 'PENDING',
				)?._id;

				if (!paymentId) {
					const initiateResult = await initiatePayment({
						variables: {
							input: {
								bookingId,
								paymentMethod,
								paymentType: 'DEPOSIT',
							},
						},
					});
					paymentId = initiateResult.data?.initiatePayment?._id as string | undefined;
					if (!paymentId) throw new Error('Payment initiation failed');
				}

				const mockMethod = paymentMethod === 'CARD' ? 'CARD' : 'KAKAOPAY';
				const confirmResult = await confirmPayment({
					variables: {
						input: {
							paymentId,
							transactionId: MOCK_TRANSACTION_IDS[mockMethod],
						},
					},
					refetchQueries: [
						MY_BOOKINGS_REFETCH,
						TECHNICIAN_PAYMENTS_REFETCH,
						{ query: GET_BOOKING_PAYMENTS, variables: { bookingId } },
					],
					awaitRefetchQueries: true,
				});
				return (confirmResult.data?.confirmPayment as Payment) ?? null;
			} catch (err) {
				await sweetErrorHandling(err);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[confirmPayment, initiatePayment, loadPayments],
	);

	return { payDeposit, loadPayments, loading, isDepositPaid, getDepositPayment };
}
