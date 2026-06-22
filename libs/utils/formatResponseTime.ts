/** Format avg response minutes for cards and profile stats. */
export function formatAvgResponseMinutes(minutes?: number | null): string | null {
	if (minutes == null || !Number.isFinite(minutes)) return null;
	const rounded = Math.round(minutes);
	if (rounded < 60) return `~${rounded}m`;
	const hours = Math.floor(rounded / 60);
	const mins = rounded % 60;
	return mins > 0 ? `~${hours}h ${mins}m` : `~${hours}h`;
}

export function formatTrendPercent(value?: number | null, decimals = 0): string {
	if (value == null || !Number.isFinite(value)) return '—';
	const sign = value > 0 ? '+' : '';
	return `${sign}${value.toFixed(decimals)}%`;
}
