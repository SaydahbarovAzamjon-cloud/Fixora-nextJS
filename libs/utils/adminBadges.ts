import type { BookingStatus } from '../types/fixora/fixora';
import type { BadgeTone } from '../components/admin/shared/AdminStatusBadge';

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

/** i18n key under admin namespace — `verification.statuses.*` */
export function verificationStatusLabelKey(status: string): string {
	switch (status) {
		case 'PENDING':
			return 'verification.statuses.PENDING';
		case 'UNDER_REVIEW':
			return 'verification.statuses.UNDER_REVIEW';
		case 'APPROVED':
			return 'verification.statuses.APPROVED';
		case 'REJECTED':
			return 'verification.statuses.REJECTED';
		case 'NONE':
			return 'verification.statuses.NONE';
		default:
			return 'verification.statuses.NONE';
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

/** Burgundy-aligned chart palette for admin dashboards */
export const ADMIN_CHART_COLORS = [
	'#52c41a',
	'#e85a6f',
	'#730c1e',
	'#faad14',
	'#ff4d4f',
	'#8a8a8a',
] as const;

export const ADMIN_CHART_THEME = {
	grid: 'rgba(115, 12, 30, 0.15)',
	tick: '#8a8a8a',
	bar: '#e85a6f',
	line: '#730c1e',
	tooltipBg: '#2a1518',
	tooltipBorder: 'rgba(115, 12, 30, 0.45)',
} as const;

export function bookingStatusDotClass(status: string): string {
	const key = status.toLowerCase();
	return `fixora-admin-status-dot--${key}`;
}
