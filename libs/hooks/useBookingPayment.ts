import { useCallback, useState } from 'react';
import { useLazyQuery, useMutation, useReactiveVar } from '@apollo/client';
import { CONFIRM_PAYMENT, GET_BOOKING_PAYMENTS, INITIATE_PAYMENT } from '../../apollo/user/payment';
import { GET_MY_BOOKINGS, GET_MY_PAYMENTS } from '../../apollo/user/profile';
import { userVar } from '../../apollo/store';
import { sweetErrorHandling, sweetMixinErrorAlert } from '../sweetAlert';
import { isTechnicianUser } from '../utils/userRole';
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

export function getFinalPayment(payments: Payment[] | undefined): Payment | undefined {
	return payments?.find((p) => p.paymentType === 'FINAL');
}

export function isDepositPaid(payments: Payment[] | undefined, isPaid?: boolean): boolean {
	const deposit = getDepositPayment(payments);
	return deposit?.paymentStatus === 'COMPLETED' || !!isPaid;
}

export function isFinalPaid(payments: Payment[] | undefined): boolean {
	const finalPayment = getFinalPayment(payments);
	return finalPayment?.paymentStatus === 'COMPLETED';
}

async function runPaymentFlow(
	bookingId: string,
	paymentType: 'DEPOSIT' | 'FINAL',
	paymentMethod: PaymentMethod,
	loadPayments: (bookingId: string) => Promise<Payment[]>,
	initiatePayment: ReturnType<typeof useMutation>[0],
	confirmPayment: ReturnType<typeof useMutation>[0],
	refetchTechnicianPayments: boolean,
): Promise<Payment | null> {
	const existing = await loadPayments(bookingId);
	const completed = existing.find(
		(p) => p.paymentType === paymentType && p.paymentStatus === 'COMPLETED',
	);
	if (completed) return completed;

	let paymentId = existing.find(
		(p) => p.paymentType === paymentType && p.paymentStatus === 'PENDING',
	)?._id;

	if (!paymentId) {
		const initiateResult = await initiatePayment({
			variables: {
				input: {
					bookingId,
					paymentMethod,
					paymentType,
				},
			},
		});
		paymentId = initiateResult.data?.initiatePayment?._id as string | undefined;
		if (!paymentId) throw new Error('Payment initiation failed');
	}

	const mockMethod = paymentMethod === 'CARD' ? 'CARD' : 'KAKAOPAY';
	const refetchQueries = [
		MY_BOOKINGS_REFETCH,
		{ query: GET_BOOKING_PAYMENTS, variables: { bookingId } },
	];
	if (refetchTechnicianPayments) {
		refetchQueries.splice(1, 0, TECHNICIAN_PAYMENTS_REFETCH);
	}
	const confirmResult = await confirmPayment({
		variables: {
			input: {
				paymentId,
				transactionId: MOCK_TRANSACTION_IDS[mockMethod],
			},
		},
		refetchQueries,
		awaitRefetchQueries: true,
	});
	return (confirmResult.data?.confirmPayment as Payment) ?? null;
}

export function useBookingPayment() {
	const [loading, setLoading] = useState(false);
	const user = useReactiveVar(userVar);
	const [initiatePayment] = useMutation(INITIATE_PAYMENT);
	const [confirmPayment] = useMutation(CONFIRM_PAYMENT);
	const [fetchPayments] = useLazyQuery(GET_BOOKING_PAYMENTS, { fetchPolicy: 'network-only' });
	const refetchTechnicianPayments = isTechnicianUser(user);

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
				return await runPaymentFlow(
					bookingId,
					'DEPOSIT',
					paymentMethod,
					loadPayments,
					initiatePayment,
					confirmPayment,
					refetchTechnicianPayments,
				);
			} catch (err) {
				await sweetErrorHandling(err);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[confirmPayment, initiatePayment, loadPayments, refetchTechnicianPayments],
	);

	const payFinal = useCallback(
		async (
			bookingId: string,
			paymentMethod: PaymentMethod = 'KAKAOPAY',
			bookingStatus?: BookingStatus,
			depositPaid?: boolean,
		): Promise<Payment | null> => {
			if (!depositPaid) {
				await sweetMixinErrorAlert('Please pay the deposit before the final payment.');
				return null;
			}
			if (bookingStatus && bookingStatus !== 'IN_PROGRESS' && bookingStatus !== 'COMPLETED') {
				await sweetMixinErrorAlert('Final payment is available when your repair is in progress or complete.');
				return null;
			}

			setLoading(true);
			try {
				return await runPaymentFlow(
					bookingId,
					'FINAL',
					paymentMethod,
					loadPayments,
					initiatePayment,
					confirmPayment,
					refetchTechnicianPayments,
				);
			} catch (err) {
				await sweetErrorHandling(err);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[confirmPayment, initiatePayment, loadPayments, refetchTechnicianPayments],
	);

	return {
		payDeposit,
		payFinal,
		loadPayments,
		loading,
		isDepositPaid,
		isFinalPaid,
		getDepositPayment,
		getFinalPayment,
	};
}
