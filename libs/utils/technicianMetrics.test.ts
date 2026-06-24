import { describe, expect, it } from 'vitest';
import {
	buildDeviceBreakdown,
	computeCompletionRate,
	computeRateDeltaTrend,
	computeRepeatClientRate,
	filterCompletedInRange,
	type TechnicianBooking,
} from './technicianMetrics';

const completedBooking = (overrides: Partial<TechnicianBooking> = {}): TechnicianBooking => ({
	_id: 'b1',
	bookingStatus: 'COMPLETED',
	createdAt: new Date().toISOString(),
	finalPrice: 100_000,
	deviceData: { deviceCategory: 'IPHONE', deviceModel: 'iPhone 14' },
	aiClassification: { issueCategory: 'SCREEN' },
	userId: 'user-1',
	...overrides,
});

describe('technicianMetrics', () => {
	it('computeCompletionRate returns null when no terminal bookings', () => {
		expect(computeCompletionRate([])).toBeNull();
	});

	it('computeCompletionRate calculates completed vs terminal ratio', () => {
		const bookings: TechnicianBooking[] = [
			completedBooking(),
			{ ...completedBooking(), bookingStatus: 'CANCELLED', _id: 'b2' },
		];
		expect(computeCompletionRate(bookings)).toBe(50);
	});

	it('computeRepeatClientRate counts clients with 2+ completed jobs', () => {
		const bookings: TechnicianBooking[] = [
			completedBooking({ userId: 'u1', _id: 'a' }),
			completedBooking({ userId: 'u1', _id: 'b' }),
			completedBooking({ userId: 'u2', _id: 'c' }),
		];
		expect(computeRepeatClientRate(bookings)).toBe(50);
	});

	it('buildDeviceBreakdown groups by device category', () => {
		const bookings: TechnicianBooking[] = [
			completedBooking({ deviceData: { deviceCategory: 'IPHONE' } }),
			completedBooking({ _id: 'b2', deviceData: { deviceCategory: 'MACBOOK' } }),
			completedBooking({ _id: 'b3', deviceData: { deviceCategory: 'IPHONE' } }),
		];
		const data = buildDeviceBreakdown(bookings);
		expect(data).toHaveLength(2);
		expect(data.find((d) => d.category === 'IPHONE')?.value).toBe(67);
	});

	it('filterCompletedInRange respects 7 Days window', () => {
		const old = completedBooking({
			_id: 'old',
			completedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
		});
		const recent = completedBooking({ _id: 'new', completedAt: new Date().toISOString() });
		const inRange = filterCompletedInRange([old, recent], '7 Days');
		expect(inRange).toHaveLength(1);
		expect(inRange[0]._id).toBe('new');
	});

	it('computeRateDeltaTrend shows delta between periods', () => {
		const now = Date.now();
		const current = completedBooking({
			_id: 'c1',
			createdAt: new Date(now - 86400000).toISOString(),
			bookingStatus: 'COMPLETED',
		});
		const previous = completedBooking({
			_id: 'p1',
			createdAt: new Date(now - 10 * 86400000).toISOString(),
			bookingStatus: 'CANCELLED',
		});
		const trend = computeRateDeltaTrend([current, previous], '7 Days', computeCompletionRate);
		expect(trend).toBe('+100%');
	});
});
