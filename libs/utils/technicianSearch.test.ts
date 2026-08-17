import { describe, expect, it } from 'vitest';
import {
	buildRecommendTechniciansInput,
	getTechniciansResultsInput,
	prepareTechniciansQueryInput,
	resolveTextSearchFilters,
} from './technicianSearch';

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

describe('buildRecommendTechniciansInput', () => {
	it('maps issue-only filter for recommendTechnicians', () => {
		expect(
			buildRecommendTechniciansInput({
				isOnline: null,
				issueCategory: 'SCREEN',
			}),
		).toEqual({
			issueCategory: 'SCREEN',
			limit: 5,
		});
	});

	it('includes problemText when search text is long enough', () => {
		expect(
			buildRecommendTechniciansInput({
				isOnline: null,
				text: 'broken screen',
				issueCategory: 'SCREEN',
			}),
		).toEqual({
			problemText: 'broken screen',
			issueCategory: 'SCREEN',
			limit: 5,
		});
	});
});
describe('getTechniciansResultsInput', () => {
	it('keeps geo radius when text search and map location are both active', () => {
		const input = getTechniciansResultsInput({
			page: 1,
			limit: 10,
			search: {
				isOnline: null,
				text: 'Screen',
				latitude: 35.17,
				longitude: 129.07,
				radiusKm: 10,
				userLocation: 'Busan',
			},
		});

		expect(input.search.text).toBe('Screen');
		expect(input.search.latitude).toBe(35.17);
		expect(input.search.longitude).toBe(129.07);
		expect(input.search.radiusKm).toBe(30);
		expect(input.search.userLocation).toBeUndefined();
	});

	it('does not send userLocation label to GraphQL (display-only)', () => {
		const input = prepareTechniciansQueryInput({
			page: 1,
			limit: 10,
			search: {
				isOnline: null,
				userLocation: '경남, 양산시',
			},
		});

		expect(input.search.userLocation).toBeUndefined();
		expect(input.search.isOnline).toBeNull();
	});

	it('strips geo when only text search is active (no map point)', () => {
		const input = getTechniciansResultsInput({
			page: 1,
			limit: 10,
			search: {
				isOnline: null,
				text: 'Screen',
			},
		});

		expect(input.search.text).toBe('Screen');
		expect(input.search.latitude).toBeUndefined();
		expect(input.search.longitude).toBeUndefined();
	});
});
