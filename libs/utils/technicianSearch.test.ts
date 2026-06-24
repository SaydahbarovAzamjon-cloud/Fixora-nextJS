import { describe, expect, it } from 'vitest';
import { getTechniciansResultsInput, resolveTextSearchFilters } from './technicianSearch';

describe('resolveTextSearchFilters', () => {
	it('maps partial screen keyword to SCREEN issue category', () => {
		expect(resolveTextSearchFilters('Screen')).toEqual({
			text: 'Screen',
			issueCategory: 'SCREEN',
			deviceCategory: undefined,
		});
	});

	it('maps exact service label', () => {
		expect(resolveTextSearchFilters('Screen Repair', { screenRepair: 'Screen Repair' })).toEqual({
			text: 'Screen Repair',
			issueCategory: 'SCREEN',
			deviceCategory: undefined,
		});
	});
});

describe('getTechniciansResultsInput', () => {
	it('strips geo radius when text search is active', () => {
		const input = getTechniciansResultsInput({
			page: 1,
			limit: 10,
			search: {
				isOnline: null,
				text: 'Screen',
				latitude: 35.17,
				longitude: 129.07,
				radiusKm: 10,
			},
		});

		expect(input.search.text).toBe('Screen');
		expect(input.search.latitude).toBeUndefined();
		expect(input.search.longitude).toBeUndefined();
		expect(input.search.radiusKm).toBeUndefined();
	});
});
