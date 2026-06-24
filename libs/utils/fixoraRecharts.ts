import type { CSSProperties } from 'react';
import type { useFixoraChartTheme } from '../hooks/useFixoraChartTheme';

type ChartTheme = ReturnType<typeof useFixoraChartTheme>;

/** Shared Recharts tooltip surface — readable in dark + light technician themes. */
export function fixoraRechartsTooltipContentStyle(): CSSProperties {
	return {
		background: 'var(--fixora-surface-elevated)',
		border: '1px solid var(--fixora-border-subtle)',
		borderRadius: 8,
		color: 'var(--fixora-text-primary)',
		boxShadow: 'var(--fixora-select-shadow, 0 12px 30px rgba(0, 0, 0, 0.25))',
	};
}

export function fixoraRechartsTooltipLabelStyle(): CSSProperties {
	return {
		color: 'var(--fixora-text-secondary)',
		fontSize: 12,
		fontWeight: 600,
		marginBottom: 4,
	};
}

export function fixoraRechartsTooltipItemStyle(accent?: string): CSSProperties {
	return {
		color: accent ?? 'var(--fixora-primary-hover)',
		fontSize: 13,
		fontWeight: 600,
	};
}

export function fixoraRechartsTooltipProps(chart: ChartTheme) {
	return {
		contentStyle: fixoraRechartsTooltipContentStyle(),
		labelStyle: fixoraRechartsTooltipLabelStyle(),
		itemStyle: fixoraRechartsTooltipItemStyle(chart.primaryHover),
		cursor: { fill: chart.barHover },
	};
}
