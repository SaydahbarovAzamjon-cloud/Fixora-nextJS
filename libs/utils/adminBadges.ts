import type { BookingStatus } from '../fixora/fixora';
import type { BadgeTone } from '../../components/admin/shared/AdminStatusBadge';

export function bookingStatusTone(status: BookingStatus): BadgeTone {
	switch (status) {
		case 'COMPLETED':
			return 'success';
		case 'ACCEPTED':
			return 'success';
		case 'IN_PROGRESS':
			return 'warning';
		case 'PENDING':
			return 'warning';
		case 'CANCELLED':
		case 'REJECTED':
			return 'danger';
		default:
			return 'neutral';
	}
}

export function userRoleTone(role: string): BadgeTone {
	switch (role) {
		case 'TECHNICIAN':
			return 'purple';
		case 'ADMIN':
			return 'primary';
		case 'USER':
			return 'blue';
		default:
			return 'neutral';
	}
}

export function userStatusTone(status: string): BadgeTone {
	switch (status) {
		case 'ACTIVE':
			return 'success';
		case 'BLOCK':
			return 'danger';
		default:
			return 'neutral';
	}
}

export function paymentStatusTone(status: string): BadgeTone {
	switch (status) {
		case 'COMPLETED':
			return 'success';
		case 'PENDING':
			return 'warning';
		case 'FAILED':
			return 'danger';
		case 'REFUNDED':
			return 'info';
		default:
			return 'neutral';
	}
}

export function verificationStatusTone(status: string): BadgeTone {
	switch (status) {
		case 'APPROVED':
			return 'success';
		case 'UNDER_REVIEW':
			return 'warning';
		case 'PENDING':
			return 'primary';
		case 'REJECTED':
			return 'danger';
		default:
			return 'neutral';
	}
}

export const BOOKING_STATUS_DOT: Record<string, string> = {
	PENDING: '#faad14',
	ACCEPTED: '#52c41a',
	IN_PROGRESS: '#e85a6f',
	COMPLETED: '#52c41a',
	CANCELLED: '#ff4d4f',
	REJECTED: '#8a8a8a',
};
