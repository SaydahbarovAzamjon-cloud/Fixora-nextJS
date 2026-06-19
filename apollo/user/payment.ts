import { gql } from '@apollo/client';

const PAYMENT_FIELDS = `
	_id
	bookingId
	paymentAmount
	paymentMethod
	paymentStatus
	paymentType
	transactionId
	paidAt
	createdAt
`;

export const INITIATE_PAYMENT = gql`
	mutation InitiatePayment($input: InitiatePaymentInput!) {
		initiatePayment(input: $input) {
			${PAYMENT_FIELDS}
		}
	}
`;

export const CONFIRM_PAYMENT = gql`
	mutation ConfirmPayment($input: ConfirmPaymentInput!) {
		confirmPayment(input: $input) {
			${PAYMENT_FIELDS}
		}
	}
`;

export const GET_BOOKING_PAYMENTS = gql`
	query GetBookingPayments($bookingId: String!) {
		getBookingPayments(bookingId: $bookingId) {
			${PAYMENT_FIELDS}
		}
	}
`;
