import { useMemo } from 'react';
import { useFixoraTheme } from '../components/theme/FixoraThemeProvider';

const FALLBACK = {
	primary: '#730c1e',
	primaryHover: '#8e1428',
	grid: 'rgba(255, 255, 255, 0.05)',
	axis: '#808080',
	axisMuted: '#707070',
	tooltipCursor: 'rgba(255, 255, 255, 0.15)',
	barHover: 'rgba(255, 255, 255, 0.04)',
	starInactive: '#3a3a3a',
	blue: '#3B82F6',
	starActive: '#F59E0B',
};

function readChartToken(name: string, fallback: string): string {
	if (typeof window === 'undefined') return fallback;
	const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	return value || fallback;
}

export function useFixoraChartTheme() {
	const { mode } = useFixoraTheme();

	return useMemo(
		() => ({
			primary: readChartToken('--fixora-primary', FALLBACK.primary),
			primaryHover: readChartToken('--fixora-primary-hover', FALLBACK.primaryHover),
			grid: readChartToken('--fixora-chart-grid', FALLBACK.grid),
			axis: readChartToken('--fixora-chart-axis', FALLBACK.axis),
			axisMuted: readChartToken('--fixora-chart-axis-muted', FALLBACK.axisMuted),
			tooltipCursor: readChartToken('--fixora-chart-tooltip-cursor', FALLBACK.tooltipCursor),
			barHover: readChartToken('--fixora-chart-bar-hover', FALLBACK.barHover),
			starInactive: readChartToken('--fixora-chart-star-inactive', FALLBACK.starInactive),
			blue: FALLBACK.blue,
			starActive: FALLBACK.starActive,
		}),
		[mode],
	);
}
