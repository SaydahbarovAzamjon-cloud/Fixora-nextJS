import { formatKrw } from './formatCurrency';

export type AnalyticsRange = '7 Days' | '30 Days' | '3 Months' | 'Year';
export type EarningsRange = 'This Week' | 'This Month' | 'Last 3 Mo' | 'This Year';
export type DashboardPeriod = 'Week' | 'Month' | 'Year';

export interface TechnicianBooking {
	_id?: string;
	bookingStatus?: string;
	finalPrice?: number | string | null;
	estimatedPrice?: number | string | null;
	completedAt?: string | null;
	bookingDate?: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
	userId?: string;
	problemTitle?: string | null;
	isPaid?: boolean;
	customerData?: {
		_id?: string;
		userNickname?: string | null;
		userFullName?: string | null;
	};
	deviceData?: {
		deviceCategory?: string | null;
		deviceModel?: string | null;
		deviceBrand?: string | null;
	};
	aiClassification?: {
		issueCategory?: string | null;
		deviceType?: string | null;
	};
}

export interface TechnicianReview {
	_id?: string;
	repairQuality?: number;
	repairSpeed?: number;
	communication?: number;
	createdAt?: string | null;
	userId?: string;
}

export interface TechnicianPayment {
	_id?: string;
	bookingId?: string;
	paymentAmount?: number;
	paymentStatus?: string;
	paymentType?: string;
	paidAt?: string | null;
	createdAt?: string | null;
}

export type TxStatus = 'Paid' | 'Pending' | 'Processing';

export interface TransactionRow {
	name: string;
	ref: string;
	service: string;
	amount: number;
	status: TxStatus;
}

export interface RevenueJobsPoint {
	day: string;
	revenue: number;
	jobs: number;
}

export interface DailyEarningsPoint {
	day: string;
	earned: number;
	pending: number;
}

export interface DeviceBreakdownItem {
	name: string;
	category: string;
	value: number;
	color: string;
}

export interface IssueRevenueItem {
	type: string;
	issueKey: string;
	revenue: number;
	color: string;
}

export interface RatingTrendPoint {
	week: string;
	rating: number;
}

export interface TopClientItem {
	name: string;
	initial: string;
	stars: number;
	amount: string;
	jobs: string;
}

export interface MonthlyPayoutPoint {
	month: string;
	payout: number;
	color: string;
}

const DEVICE_COLORS: Record<string, string> = {
	IPHONE: '#FF6B00',
	MACBOOK: '#3B82F6',
	IPAD: '#22C55E',
	APPLE_WATCH: '#A855F7',
};

const DEVICE_LABELS: Record<string, string> = {
	IPHONE: 'iPhone',
	MACBOOK: 'MacBook',
	IPAD: 'iPad',
	APPLE_WATCH: 'Apple Watch',
};

const ISSUE_COLORS: Record<string, string> = {
	Screen: '#FF6B00',
	Battery: '#FBBF77',
	Water: '#3B82F6',
	Camera: '#22C55E',
	Logic: '#A855F7',
	Charging: '#F5C518',
	Other: '#909090',
};

const MONTH_COLORS = ['#7C6FF0', '#7C6FF0', '#7C6FF0', '#7C6FF0', '#FF6B00', '#3B82F6', '#22C55E', '#A855F7', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6'];

export function withFallback<T>(real: T[], demo: T[], hasReal?: boolean): T[] {
	const useReal = hasReal ?? real.length > 0;
	return useReal ? real : demo;
}

export function hasRealBookings(bookings: TechnicianBooking[]): boolean {
	return bookings.some((b) => b?.bookingStatus === 'COMPLETED');
}

export function parsePrice(booking?: TechnicianBooking | null): number {
	if (!booking) return 0;
	const raw = booking.finalPrice ?? booking.estimatedPrice;
	const num = parseFloat(String(raw ?? ''));
	return Number.isNaN(num) ? 0 : num;
}

export function completionDate(booking: TechnicianBooking): Date {
	return new Date(booking?.completedAt || booking?.bookingDate || booking?.updatedAt || booking?.createdAt || 0);
}

export function customerName(booking?: TechnicianBooking | null): string {
	return booking?.customerData?.userFullName || booking?.customerData?.userNickname || 'Customer';
}

export function deviceServiceLabel(booking?: TechnicianBooking | null): string {
	const d = booking?.deviceData;
	return d?.deviceModel?.trim() || d?.deviceBrand?.trim() || booking?.problemTitle || 'Repair';
}

export function bookingRef(booking: TechnicianBooking): string {
	const id = booking._id ?? '';
	const suffix = id.slice(-3).toUpperCase() || '000';
	const prefix = booking.bookingStatus === 'PENDING' ? 'REQ' : 'JOB';
	return `${prefix}-${suffix}`;
}

export function reviewAverage(review: TechnicianReview): number {
	const q = review.repairQuality ?? 0;
	const s = review.repairSpeed ?? 0;
	const c = review.communication ?? 0;
	return (q + s + c) / 3;
}

function rangeStart(range: AnalyticsRange | EarningsRange): Date {
	const now = new Date();
	const start = new Date(now);
	start.setHours(0, 0, 0, 0);

	if (range === '7 Days' || range === 'This Week') {
		start.setDate(now.getDate() - 6);
		return start;
	}
	if (range === '30 Days' || range === 'This Month') {
		start.setDate(1);
		return start;
	}
	if (range === '3 Months' || range === 'Last 3 Mo') {
		start.setMonth(now.getMonth() - 2, 1);
		return start;
	}
	start.setMonth(0, 1);
	return start;
}

export function filterCompletedInRange(bookings: TechnicianBooking[], range: AnalyticsRange | EarningsRange): TechnicianBooking[] {
	const start = rangeStart(range);
	return bookings.filter((b) => {
		if (b.bookingStatus !== 'COMPLETED') return false;
		const when = completionDate(b);
		return !Number.isNaN(when.getTime()) && when >= start;
	});
}

export function getCompletedBookings(bookings: TechnicianBooking[]): TechnicianBooking[] {
	return bookings.filter((b) => b.bookingStatus === 'COMPLETED');
}

export function buildWeekSeries(
	completed: TechnicianBooking[],
	mapPoint: (label: string, revenue: number, jobs: number) => RevenueJobsPoint | DailyEarningsPoint,
	mode: 'revenue' | 'earnings',
	pendingBookings: TechnicianBooking[] = [],
): (RevenueJobsPoint | DailyEarningsPoint)[] {
	const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const buckets = labels.map((label) => ({ label, revenue: 0, jobs: 0, earned: 0, pending: 0 }));
	const now = new Date();
	const monday = new Date(now);
	const dow = (now.getDay() + 6) % 7;
	monday.setHours(0, 0, 0, 0);
	monday.setDate(now.getDate() - dow);
	const nextMonday = new Date(monday);
	nextMonday.setDate(monday.getDate() + 7);

	completed.forEach((b) => {
		const when = completionDate(b);
		if (Number.isNaN(when.getTime()) || when < monday || when >= nextMonday) return;
		const idx = (when.getDay() + 6) % 7;
		buckets[idx].revenue += parsePrice(b);
		buckets[idx].earned += parsePrice(b);
		buckets[idx].jobs += 1;
	});

	if (mode === 'earnings') {
		pendingBookings.forEach((b) => {
			const when = new Date(b.bookingDate || b.createdAt || 0);
			if (Number.isNaN(when.getTime()) || when < monday || when >= nextMonday) return;
			const idx = (when.getDay() + 6) % 7;
			buckets[idx].pending += parsePrice(b);
		});
	}

	return buckets.map((b) =>
		mode === 'earnings'
			? ({ day: b.label, earned: b.earned, pending: b.pending } as DailyEarningsPoint)
			: ({ day: b.label, revenue: b.revenue, jobs: b.jobs } as RevenueJobsPoint),
	);
}

export function buildRevenueJobsSeries(bookings: TechnicianBooking[], range: AnalyticsRange): RevenueJobsPoint[] {
	const completed = filterCompletedInRange(bookings, range);
	if (range === '7 Days') {
		return buildWeekSeries(completed, (day, revenue, jobs) => ({ day, revenue, jobs }), 'revenue') as RevenueJobsPoint[];
	}

	if (range === '30 Days') {
		const buckets: RevenueJobsPoint[] = Array.from({ length: 4 }).map((_, i) => ({
			day: `W${i + 1}`,
			revenue: 0,
			jobs: 0,
		}));
		const start = rangeStart(range);
		completed.forEach((b) => {
			const when = completionDate(b);
			const weekIdx = Math.min(3, Math.floor((when.getTime() - start.getTime()) / (7 * 86400000)));
			if (weekIdx >= 0) {
				buckets[weekIdx].revenue += parsePrice(b);
				buckets[weekIdx].jobs += 1;
			}
		});
		return buckets;
	}

	if (range === '3 Months') {
		const now = new Date();
		const buckets: RevenueJobsPoint[] = Array.from({ length: 3 }).map((_, i) => {
			const d = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1);
			return { day: d.toLocaleDateString('en-US', { month: 'short' }), revenue: 0, jobs: 0 };
		});
		const start = rangeStart(range);
		completed.forEach((b) => {
			const when = completionDate(b);
			if (when < start) return;
			const monthKey = `${when.getFullYear()}-${when.getMonth()}`;
			const idx = buckets.findIndex((_, i) => {
				const d = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1);
				return `${d.getFullYear()}-${d.getMonth()}` === monthKey;
			});
			if (idx >= 0) {
				buckets[idx].revenue += parsePrice(b);
				buckets[idx].jobs += 1;
			}
		});
		return buckets;
	}

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const year = new Date().getFullYear();
	const buckets = months.map((day) => ({ day, revenue: 0, jobs: 0 }));
	completed.forEach((b) => {
		const when = completionDate(b);
		if (when.getFullYear() !== year) return;
		buckets[when.getMonth()].revenue += parsePrice(b);
		buckets[when.getMonth()].jobs += 1;
	});
	return buckets;
}

export function buildDailyEarningsSeries(
	bookings: TechnicianBooking[],
	range: EarningsRange,
): DailyEarningsPoint[] {
	const completed = filterCompletedInRange(bookings, range);
	const pending = bookings.filter((b) => ['ACCEPTED', 'IN_PROGRESS'].includes(b.bookingStatus ?? ''));

	if (range === 'This Week') {
		return buildWeekSeries(completed, (day, earned, _jobs) => ({ day, earned, pending: 0 }), 'earnings', pending) as DailyEarningsPoint[];
	}

	const labels =
		range === 'This Month'
			? ['W1', 'W2', 'W3', 'W4']
			: range === 'Last 3 Mo'
				? Array.from({ length: 3 }).map((_, i) => {
						const d = new Date();
						d.setMonth(d.getMonth() - (2 - i));
						return d.toLocaleDateString('en-US', { month: 'short' });
					})
				: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	const buckets: DailyEarningsPoint[] = labels.map((day) => ({ day, earned: 0, pending: 0 }));
	const start = rangeStart(range);

	completed.forEach((b) => {
		const when = completionDate(b);
		if (when < start) return;
		let idx = 0;
		if (range === 'This Month') {
			idx = Math.min(3, Math.floor((when.getTime() - start.getTime()) / (7 * 86400000)));
		} else if (range === 'Last 3 Mo') {
			idx = labels.findIndex((_, i) => {
				const d = new Date();
				d.setMonth(d.getMonth() - (2 - i));
				return d.getMonth() === when.getMonth() && d.getFullYear() === when.getFullYear();
			});
		} else {
			idx = when.getMonth();
		}
		if (idx >= 0) buckets[idx].earned += parsePrice(b);
	});

	pending.forEach((b) => {
		const when = new Date(b.bookingDate || b.createdAt || 0);
		if (when < start) return;
		let idx = 0;
		if (range === 'This Month') idx = Math.min(3, Math.floor((when.getTime() - start.getTime()) / (7 * 86400000)));
		else if (range === 'Last 3 Mo') {
			idx = labels.findIndex((_, i) => {
				const d = new Date();
				d.setMonth(d.getMonth() - (2 - i));
				return d.getMonth() === when.getMonth();
			});
		} else idx = when.getMonth();
		if (idx >= 0) buckets[idx].pending += parsePrice(b);
	});

	return buckets;
}

export function buildDashboardWeekSeries(completed: TechnicianBooking[]) {
	return buildWeekSeries(completed, (day, revenue, jobs) => ({ day, revenue, jobs }), 'revenue').map((p) => {
		const point = p as RevenueJobsPoint;
		return {
			label: point.day,
			earnings: point.revenue,
			jobs: point.jobs,
		};
	});
}

export function buildDashboardMonthSeries(completed: TechnicianBooking[]) {
	const now = new Date();
	const thisMonday = new Date(now);
	const dow = (now.getDay() + 6) % 7;
	thisMonday.setHours(0, 0, 0, 0);
	thisMonday.setDate(now.getDate() - dow);

	const buckets = Array.from({ length: 4 }).map((_, i) => {
		const start = new Date(thisMonday);
		start.setDate(thisMonday.getDate() - (3 - i) * 7);
		return { start, label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), earnings: 0, jobs: 0 };
	});
	const firstStart = buckets[0].start;
	const end = new Date(thisMonday);
	end.setDate(thisMonday.getDate() + 7);

	completed.forEach((b) => {
		const when = completionDate(b);
		if (Number.isNaN(when.getTime()) || when < firstStart || when >= end) return;
		const idx = Math.min(3, Math.floor((when.getTime() - firstStart.getTime()) / (7 * 86400000)));
		buckets[idx].earnings += parsePrice(b);
		buckets[idx].jobs += 1;
	});
	return buckets.map(({ label, earnings, jobs }) => ({ label, earnings, jobs }));
}

export function buildDashboardYearSeries(completed: TechnicianBooking[]) {
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const year = new Date().getFullYear();
	const data = months.map((label) => ({ label, earnings: 0, jobs: 0 }));
	completed.forEach((b) => {
		const when = completionDate(b);
		if (Number.isNaN(when.getTime()) || when.getFullYear() !== year) return;
		data[when.getMonth()].earnings += parsePrice(b);
		data[when.getMonth()].jobs += 1;
	});
	return data;
}

export function hasSeriesData(series: { earnings?: number; revenue?: number }[]): boolean {
	return series.some((d) => (d.earnings ?? d.revenue ?? 0) > 0);
}

function mapIssueCategory(raw?: string | null): string {
	switch (raw) {
		case 'SCREEN':
			return 'Screen';
		case 'BATTERY':
			return 'Battery';
		case 'WATER_DAMAGE':
			return 'Water';
		case 'CAMERA':
			return 'Camera';
		case 'CHARGING':
			return 'Charging';
		case 'KEYBOARD':
		case 'SOFTWARE':
			return 'Logic';
		case 'GENERAL':
		default:
			return 'Other';
	}
}

function issueCategoryKey(raw?: string | null): string {
	switch (raw) {
		case 'SCREEN':
			return 'SCREEN';
		case 'BATTERY':
			return 'BATTERY';
		case 'WATER_DAMAGE':
			return 'WATER_DAMAGE';
		case 'CAMERA':
			return 'CAMERA';
		case 'CHARGING':
			return 'CHARGING';
		case 'KEYBOARD':
			return 'KEYBOARD';
		case 'SOFTWARE':
			return 'SOFTWARE';
		case 'GENERAL':
		default:
			return 'GENERAL';
	}
}

export function bookingsInAnalyticsRange(bookings: TechnicianBooking[], range: AnalyticsRange): TechnicianBooking[] {
	return bookingsCreatedBetween(bookings, rangeStart(range), new Date());
}

export function bookingsCreatedBetween(
	bookings: TechnicianBooking[],
	start: Date,
	end: Date,
): TechnicianBooking[] {
	return bookings.filter((b) => {
		const when = new Date(b.createdAt || b.updatedAt || 0);
		return !Number.isNaN(when.getTime()) && when >= start && when < end;
	});
}

export function previousRangeWindow(range: AnalyticsRange): {
	currentStart: Date;
	previousStart: Date;
	now: Date;
} {
	const now = new Date();
	const currentStart = rangeStart(range);
	const duration = Math.max(now.getTime() - currentStart.getTime(), 86400000);
	const previousStart = new Date(currentStart.getTime() - duration);
	return { currentStart, previousStart, now };
}

export function computeRateDeltaTrend(
	bookings: TechnicianBooking[],
	range: AnalyticsRange,
	computeRate: (list: TechnicianBooking[]) => number | null,
): string | null {
	const { currentStart, previousStart, now } = previousRangeWindow(range);
	const current = computeRate(bookingsCreatedBetween(bookings, currentStart, now));
	const previous = computeRate(bookingsCreatedBetween(bookings, previousStart, currentStart));
	if (current == null || previous == null) return null;
	const delta = current - previous;
	const sign = delta > 0 ? '+' : '';
	return `${sign}${Math.round(delta)}%`;
}

export function buildDeviceBreakdown(bookings: TechnicianBooking[]): DeviceBreakdownItem[] {
	const completed = getCompletedBookings(bookings);
	const counts: Record<string, number> = {};
	completed.forEach((b) => {
		const cat = b.deviceData?.deviceCategory || b.aiClassification?.deviceType || 'OTHER';
		counts[cat] = (counts[cat] || 0) + 1;
	});
	const total = Object.values(counts).reduce((s, n) => s + n, 0);
	if (total === 0) return [];

	return Object.entries(counts)
		.sort((a, b) => b[1] - a[1])
		.map(([cat, count]) => ({
			name: DEVICE_LABELS[cat] || cat,
			category: cat,
			value: Math.round((count / total) * 100),
			color: DEVICE_COLORS[cat] || '#909090',
		}));
}

export function buildIssueRevenue(bookings: TechnicianBooking[]): IssueRevenueItem[] {
	const completed = getCompletedBookings(bookings);
	const totals: Record<string, { revenue: number; issueKey: string }> = {};
	completed.forEach((b) => {
		const issueKey = issueCategoryKey(b.aiClassification?.issueCategory);
		const label = mapIssueCategory(b.aiClassification?.issueCategory);
		if (!totals[label]) {
			totals[label] = { revenue: 0, issueKey };
		}
		totals[label].revenue += parsePrice(b);
	});
	return Object.entries(totals)
		.sort((a, b) => b[1].revenue - a[1].revenue)
		.map(([type, { revenue, issueKey }]) => ({
			type,
			issueKey,
			revenue,
			color: ISSUE_COLORS[type] || '#909090',
		}));
}

export function buildRatingTrend(reviews: TechnicianReview[], range: AnalyticsRange): RatingTrendPoint[] {
	const start = rangeStart(range);
	const filtered = reviews.filter((r) => {
		const when = new Date(r.createdAt || 0);
		return !Number.isNaN(when.getTime()) && when >= start;
	});
	if (filtered.length === 0) return [];

	const sorted = [...filtered].sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
	const bucketCount = Math.min(7, Math.max(3, sorted.length));
	const size = Math.ceil(sorted.length / bucketCount);
	const points: RatingTrendPoint[] = [];

	for (let i = 0; i < bucketCount; i++) {
		const slice = sorted.slice(i * size, (i + 1) * size);
		if (slice.length === 0) continue;
		const avg = slice.reduce((s, r) => s + reviewAverage(r), 0) / slice.length;
		points.push({ week: `W${i + 1}`, rating: Math.round(avg * 100) / 100 });
	}
	return points;
}

export function buildTopClients(bookings: TechnicianBooking[], limit = 5): TopClientItem[] {
	const completed = getCompletedBookings(bookings);
	const byUser: Record<string, { name: string; total: number; jobs: number }> = {};

	completed.forEach((b) => {
		const uid = b.userId || b.customerData?._id || 'unknown';
		const name = customerName(b);
		if (!byUser[uid]) byUser[uid] = { name, total: 0, jobs: 0 };
		byUser[uid].total += parsePrice(b);
		byUser[uid].jobs += 1;
	});

	return Object.values(byUser)
		.sort((a, b) => b.total - a.total)
		.slice(0, limit)
		.map((c) => ({
			name: c.name.split(' ')[0] || c.name,
			initial: c.name.charAt(0).toUpperCase(),
			stars: 5,
			amount: formatKrw(c.total),
			jobs: `${c.jobs} job${c.jobs === 1 ? '' : 's'}`,
		}));
}

export function computeCompletionRate(bookings: TechnicianBooking[]): number | null {
	const terminal = bookings.filter((b) => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.bookingStatus ?? ''));
	if (terminal.length === 0) return null;
	const completed = terminal.filter((b) => b.bookingStatus === 'COMPLETED').length;
	return Math.round((completed / terminal.length) * 100);
}

export function computeRepeatClientRate(bookings: TechnicianBooking[]): number | null {
	const completed = getCompletedBookings(bookings);
	const counts: Record<string, number> = {};
	completed.forEach((b) => {
		const uid = b.userId || b.customerData?._id || '';
		if (!uid) return;
		counts[uid] = (counts[uid] || 0) + 1;
	});
	const clients = Object.keys(counts);
	if (clients.length === 0) return null;
	const repeat = clients.filter((id) => counts[id] >= 2).length;
	return Math.round((repeat / clients.length) * 100);
}

export function buildMonthlyPayoutsFromRecords(
	payouts: { payoutAmount: number; completedAt?: string | null; requestedAt?: string | null }[],
): MonthlyPayoutPoint[] {
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const year = new Date().getFullYear();
	const totals = months.map((month, i) => ({ month, payout: 0, color: MONTH_COLORS[i] || '#7C6FF0' }));

	payouts
		.filter((p) => p.completedAt)
		.forEach((p) => {
			const when = new Date(p.completedAt || p.requestedAt || 0);
			if (when.getFullYear() !== year) return;
			totals[when.getMonth()].payout += p.payoutAmount ?? 0;
		});

	const currentMonth = new Date().getMonth();
	return totals.slice(0, currentMonth + 1).filter((m) => m.payout > 0);
}

export function buildMonthlyPayouts(bookings: TechnicianBooking[], payments: TechnicianPayment[]): MonthlyPayoutPoint[] {
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const year = new Date().getFullYear();
	const totals = months.map((month, i) => ({ month, payout: 0, color: MONTH_COLORS[i] || '#7C6FF0' }));

	const completedPayments = payments.filter((p) => p.paymentStatus === 'COMPLETED');
	if (completedPayments.length > 0) {
		completedPayments.forEach((p) => {
			const when = new Date(p.paidAt || p.createdAt || 0);
			if (when.getFullYear() !== year) return;
			totals[when.getMonth()].payout += p.paymentAmount ?? 0;
		});
	} else {
		getCompletedBookings(bookings).forEach((b) => {
			const when = completionDate(b);
			if (when.getFullYear() !== year) return;
			totals[when.getMonth()].payout += parsePrice(b);
		});
	}

	const currentMonth = new Date().getMonth();
	return totals.slice(0, currentMonth + 1).filter((m) => m.payout > 0);
}

export function buildTransactions(bookings: TechnicianBooking[], payments: TechnicianPayment[]): TransactionRow[] {
	const paymentByBooking: Record<string, TechnicianPayment[]> = {};
	payments.forEach((p) => {
		if (!p.bookingId) return;
		if (!paymentByBooking[p.bookingId]) paymentByBooking[p.bookingId] = [];
		paymentByBooking[p.bookingId].push(p);
	});

	const rows: TransactionRow[] = bookings
		.filter((b) => !['REJECTED', 'CANCELLED'].includes(b.bookingStatus ?? ''))
		.map((b) => {
			const pays = paymentByBooking[b._id ?? ''] ?? [];
			const completedPay = pays.find((p) => p.paymentStatus === 'COMPLETED');
			const pendingPay = pays.find((p) => p.paymentStatus === 'PENDING');
			let status: TxStatus = 'Processing';
			if (completedPay || b.bookingStatus === 'COMPLETED') status = 'Paid';
			else if (pendingPay) status = 'Pending';
			else if (['ACCEPTED', 'IN_PROGRESS'].includes(b.bookingStatus ?? '')) status = 'Processing';

			const amount = completedPay?.paymentAmount ?? parsePrice(b);
			return {
				name: customerName(b),
				ref: bookingRef(b),
				service: deviceServiceLabel(b),
				amount,
				status,
			};
		})
		.sort((a, b) => b.amount - a.amount);

	return rows.slice(0, 12);
}

export function sumCompletedEarnings(bookings: TechnicianBooking[]): number {
	return getCompletedBookings(bookings).reduce((s, b) => s + parsePrice(b), 0);
}

export function sumPendingAmount(bookings: TechnicianBooking[], payments: TechnicianPayment[]): number {
	const pendingPayments = payments.filter((p) => p.paymentStatus === 'PENDING');
	if (pendingPayments.length > 0) {
		return pendingPayments.reduce((s, p) => s + (p.paymentAmount ?? 0), 0);
	}
	return bookings
		.filter((b) => ['ACCEPTED', 'IN_PROGRESS'].includes(b.bookingStatus ?? ''))
		.reduce((s, b) => s + parsePrice(b), 0);
}

export function sumThisMonthEarnings(bookings: TechnicianBooking[]): number {
	const start = new Date();
	start.setDate(1);
	start.setHours(0, 0, 0, 0);
	return getCompletedBookings(bookings)
		.filter((b) => completionDate(b) >= start)
		.reduce((s, b) => s + parsePrice(b), 0);
}

export function paymentDate(p: TechnicianPayment): Date {
	return new Date(p.paidAt || p.createdAt || 0);
}

export function getCompletedPayments(payments: TechnicianPayment[]): TechnicianPayment[] {
	return payments.filter((p) => p.paymentStatus === 'COMPLETED');
}

export function hasRealPayments(payments: TechnicianPayment[]): boolean {
	return payments.some((p) => p.paymentStatus === 'COMPLETED' || p.paymentStatus === 'PENDING');
}

export function sumCompletedPaymentEarnings(payments: TechnicianPayment[]): number {
	return getCompletedPayments(payments).reduce((s, p) => s + (p.paymentAmount ?? 0), 0);
}

export function sumThisMonthPaymentEarnings(payments: TechnicianPayment[]): number {
	const start = new Date();
	start.setDate(1);
	start.setHours(0, 0, 0, 0);
	return getCompletedPayments(payments)
		.filter((p) => paymentDate(p) >= start)
		.reduce((s, p) => s + (p.paymentAmount ?? 0), 0);
}

export function buildDashboardWeekSeriesFromPayments(payments: TechnicianPayment[]) {
	const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const buckets = labels.map((label) => ({ label, earnings: 0, jobs: 0 }));
	const now = new Date();
	const dow = (now.getDay() + 6) % 7;
	const monday = new Date(now);
	monday.setHours(0, 0, 0, 0);
	monday.setDate(now.getDate() - dow);
	const nextMonday = new Date(monday);
	nextMonday.setDate(monday.getDate() + 7);

	getCompletedPayments(payments).forEach((p) => {
		const when = paymentDate(p);
		if (when < monday || when >= nextMonday) return;
		const idx = (when.getDay() + 6) % 7;
		buckets[idx].earnings += p.paymentAmount ?? 0;
		buckets[idx].jobs += 1;
	});
	return buckets;
}

export function buildDashboardMonthSeriesFromPayments(payments: TechnicianPayment[]) {
	const now = new Date();
	const thisMonday = new Date(now);
	const dow = (now.getDay() + 6) % 7;
	thisMonday.setHours(0, 0, 0, 0);
	thisMonday.setDate(now.getDate() - dow);

	const buckets = Array.from({ length: 4 }).map((_, i) => {
		const start = new Date(thisMonday);
		start.setDate(thisMonday.getDate() - (3 - i) * 7);
		return { start, label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), earnings: 0, jobs: 0 };
	});
	const firstStart = buckets[0].start;
	const end = new Date(thisMonday);
	end.setDate(thisMonday.getDate() + 7);

	getCompletedPayments(payments).forEach((p) => {
		const when = paymentDate(p);
		if (Number.isNaN(when.getTime()) || when < firstStart || when >= end) return;
		const idx = Math.min(3, Math.floor((when.getTime() - firstStart.getTime()) / (7 * 86400000)));
		buckets[idx].earnings += p.paymentAmount ?? 0;
		buckets[idx].jobs += 1;
	});
	return buckets.map(({ label, earnings, jobs }) => ({ label, earnings, jobs }));
}

export function buildDashboardYearSeriesFromPayments(payments: TechnicianPayment[]) {
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const year = new Date().getFullYear();
	const data = months.map((label) => ({ label, earnings: 0, jobs: 0 }));
	getCompletedPayments(payments).forEach((p) => {
		const when = paymentDate(p);
		if (Number.isNaN(when.getTime()) || when.getFullYear() !== year) return;
		data[when.getMonth()].earnings += p.paymentAmount ?? 0;
		data[when.getMonth()].jobs += 1;
	});
	return data;
}

export function buildDailyEarningsSeriesWithPayments(
	bookings: TechnicianBooking[],
	payments: TechnicianPayment[],
	range: EarningsRange,
): DailyEarningsPoint[] {
	if (!hasRealPayments(payments)) return buildDailyEarningsSeries(bookings, range);

	const start = rangeStart(range);
	const completed = getCompletedPayments(payments).filter((p) => paymentDate(p) >= start);
	const pending = payments.filter((p) => p.paymentStatus === 'PENDING' && paymentDate(p) >= start);

	if (range === 'This Week') {
		const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
		const buckets = labels.map((day) => ({ day, earned: 0, pending: 0 }));
		const now = new Date();
		const dow = (now.getDay() + 6) % 7;
		const monday = new Date(now);
		monday.setHours(0, 0, 0, 0);
		monday.setDate(now.getDate() - dow);

		completed.forEach((p) => {
			const when = paymentDate(p);
			if (when < monday) return;
			const idx = (when.getDay() + 6) % 7;
			buckets[idx].earned += p.paymentAmount ?? 0;
		});
		pending.forEach((p) => {
			const when = paymentDate(p);
			if (when < monday) return;
			const idx = (when.getDay() + 6) % 7;
			buckets[idx].pending += p.paymentAmount ?? 0;
		});
		return buckets;
	}

	const base = buildDailyEarningsSeries(bookings, range);
	if (completed.length === 0) return base;

	const earnedTotal = completed.reduce((s, p) => s + (p.paymentAmount ?? 0), 0);
	const pendingTotal = pending.reduce((s, p) => s + (p.paymentAmount ?? 0), 0);
	if (base.length > 0) {
		base[base.length - 1].earned += earnedTotal;
		base[base.length - 1].pending += pendingTotal;
	}
	return base;
}

export function percentChange(current: number, previous: number): string | null {
	if (previous <= 0 || current <= 0) return null;
	const pct = ((current - previous) / previous) * 100;
	const sign = pct >= 0 ? '+' : '';
	return `${sign}${Math.round(pct)}%`;
}
