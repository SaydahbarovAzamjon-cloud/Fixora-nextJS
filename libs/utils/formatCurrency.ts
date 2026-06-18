const parseAmount = (value: number | string): number => {
	const num = typeof value === 'string' ? parseFloat(value) : value;
	return Number.isNaN(num) ? 0 : num;
};

/** Full KRW display — e.g. ₩4,180,000 */
export function formatKrw(value: number | string): string {
	const num = parseAmount(value);
	return `₩${num.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}`;
}

/** Numeric only (no symbol) for chart labels */
export function formatKrwNumber(value: number | string): string {
	const num = parseAmount(value);
	return num.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
}

/** Compact axis label — e.g. ₩120k, ₩1.2M */
export function formatKrwCompact(value: number | string): string {
	const num = parseAmount(value);
	if (num >= 1_000_000) return `₩${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
	if (num >= 1_000) return `₩${Math.round(num / 1_000)}k`;
	return `₩${Math.round(num)}`;
}

/** Build nice Y-axis ticks up to maxValue */
export function buildKrwTicks(maxValue: number, count = 5): number[] {
	const safeMax = Math.max(1, maxValue);
	const step = Math.ceil(safeMax / count / 1000) * 1000 || 1000;
	const top = Math.ceil(safeMax / step) * step;
	return Array.from({ length: count + 1 }, (_, i) => i * (top / count));
}

/** Demo fallbacks in KRW (roughly proportional to original $ mocks) */
export const DEMO_KRW = {
	totalEarned: 4_180_000,
	thisMonth: 11_200_000,
	pending: 865_000,
	nextPayout: 2_170_000,
	availableBalance: 2_170_000,
	weeklyTotal: 4_180_000,
	monthlyPayoutsTotal: 80_130_000,
} as const;
