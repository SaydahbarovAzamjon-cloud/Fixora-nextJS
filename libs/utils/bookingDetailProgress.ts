import type { BookingStatus } from '../types/fixora/fixora';

export const BOOKING_PROGRESS_STEPS = ['SUBMITTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'PAID'] as const;
export type BookingProgressStep = (typeof BOOKING_PROGRESS_STEPS)[number];

export function getBookingProgressIndex(
	status: BookingStatus,
	finalPaid: boolean,
): number {
	if (status === 'CANCELLED' || status === 'REJECTED') return -1;
	if (finalPaid) return 4;
	if (status === 'COMPLETED') return 4;
	if (status === 'IN_PROGRESS') return 2;
	if (status === 'ACCEPTED') return 1;
	return 0;
}

export function isBookingProgressStepDone(
	stepIndex: number,
	activeIndex: number,
	finalPaid: boolean,
): boolean {
	if (activeIndex < 0) return false;
	if (finalPaid) return true;
	return stepIndex < activeIndex;
}

export function isBookingProgressStepCurrent(stepIndex: number, activeIndex: number, finalPaid: boolean): boolean {
	if (activeIndex < 0) return false;
	if (finalPaid) return false;
	return stepIndex === activeIndex;
}
