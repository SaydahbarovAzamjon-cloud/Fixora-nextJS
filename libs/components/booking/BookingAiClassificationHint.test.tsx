import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BookingAiClassificationHint from './BookingAiClassificationHint';

vi.mock('next-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, opts?: { score?: number }) => {
			if (key === 'booking.aiClassification.confidence') return `Confidence: ${opts?.score}%`;
			const labels: Record<string, string> = {
				'booking.aiClassification.title': 'AI issue insight',
				'booking.aiClassification.hint': 'For your reference only',
				'booking.aiClassification.analyzing': 'Analyzing…',
				'booking.device.categories.IPHONE': 'iPhone',
				'booking.aiClassification.issueCategory.SCREEN': 'Screen',
				'booking.aiClassification.repairComplexity.LOW': 'Low complexity',
			};
			return labels[key] ?? key;
		},
	}),
}));

vi.mock('../../hooks/useBookingAiClassification', () => ({
	useBookingAiClassification: vi.fn(),
}));

import { useBookingAiClassification } from '../../hooks/useBookingAiClassification';

const mockedHook = vi.mocked(useBookingAiClassification);

describe('BookingAiClassificationHint', () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});
	it('renders nothing when not loading and no classification', () => {
		mockedHook.mockReturnValue({ classification: null, loading: false });
		const { container } = render(
			<BookingAiClassificationHint
				problemTitle=""
				problemDescription=""
				deviceIssue=""
				isNewDevice
			/>,
		);
		expect(container).toBeEmptyDOMElement();
	});

	it('shows analyzing state while loading', () => {
		mockedHook.mockReturnValue({ classification: null, loading: true });
		render(
			<BookingAiClassificationHint
				problemTitle="Cracked screen"
				problemDescription=""
				deviceIssue=""
				isNewDevice
			/>,
		);
		expect(screen.getByText('Analyzing…')).toBeInTheDocument();
	});

	it('renders classification chips when data is available', () => {
		mockedHook.mockReturnValue({
			loading: false,
			classification: {
				deviceType: 'IPHONE',
				issueCategory: 'SCREEN',
				repairComplexity: 'LOW',
				confidenceScore: 0.87,
				keywords: ['display'],
				provider: 'RULE_BASED',
			},
		});
		render(
			<BookingAiClassificationHint
				problemTitle="iPhone screen"
				problemDescription=""
				deviceIssue=""
				isNewDevice
			/>,
		);
		expect(screen.getByText('AI issue insight')).toBeInTheDocument();
		expect(screen.getByText('iPhone')).toBeInTheDocument();
		expect(screen.getByText('Screen')).toBeInTheDocument();
		expect(screen.getByText('Confidence: 87%')).toBeInTheDocument();
	});
});
