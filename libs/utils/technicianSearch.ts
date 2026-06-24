import {
	SERVICE_DEVICE_CATEGORY,
	SERVICE_ISSUE_CATEGORY,
	SERVICES,
} from '../components/search/categoryMappings';
import type { TechniciansInquiry } from '../types/fixora/fixora';

const KEYWORD_TO_SERVICE: Record<string, (typeof SERVICES)[number]> = {
	screen: 'screenRepair',
	battery: 'batteryIssue',
	water: 'waterDamage',
	iphone: 'iphoneRepair',
	macbook: 'macbookRepair',
};

export interface ResolvedTextSearch {
	text?: string;
	issueCategory?: string;
	deviceCategory?: string;
}

/** Map hero/search-bar text to TISearch filters (keyword + translated label match). */
export function resolveTextSearchFilters(
	rawText: string,
	serviceLabels?: Partial<Record<(typeof SERVICES)[number], string>>,
): ResolvedTextSearch {
	const trimmed = rawText.trim();
	if (!trimmed) return {};

	for (const key of SERVICES) {
		const label = serviceLabels?.[key]?.trim();
		if (label && trimmed.localeCompare(label, undefined, { sensitivity: 'accent' }) === 0) {
			return {
				text: trimmed,
				issueCategory: SERVICE_ISSUE_CATEGORY[key],
				deviceCategory: SERVICE_DEVICE_CATEGORY[key],
			};
		}
	}

	const lower = trimmed.toLowerCase();
	for (const [keyword, serviceKey] of Object.entries(KEYWORD_TO_SERVICE)) {
		if (lower.includes(keyword)) {
			return {
				text: trimmed,
				issueCategory: SERVICE_ISSUE_CATEGORY[serviceKey],
				deviceCategory: SERVICE_DEVICE_CATEGORY[serviceKey],
			};
		}
	}

	return { text: trimmed };
}

/**
 * Main search results query — text/category discovery is nationwide.
 * GPS radius from the map must not empty results when the user searches by problem.
 */
export function getTechniciansResultsInput(filter: TechniciansInquiry): TechniciansInquiry {
	const { text, issueCategory, deviceCategory, latitude, longitude, radiusKm, ...rest } = filter.search;
	const hasDiscoveryFilter = Boolean(text?.trim() || issueCategory || deviceCategory);

	if (!hasDiscoveryFilter) return filter;

	return {
		...filter,
		search: {
			...rest,
			text: text?.trim() || undefined,
			issueCategory,
			deviceCategory,
			isOnline: filter.search.isOnline ?? null,
			latitude: undefined,
			longitude: undefined,
			radiusKm: undefined,
		},
	};
}

export function parseSearchPageQueryInput(raw: string): TechniciansInquiry {
	try {
		return JSON.parse(decodeURIComponent(raw)) as TechniciansInquiry;
	} catch {
		return JSON.parse(raw) as TechniciansInquiry;
	}
}

export function serializeSearchPageQueryInput(filter: TechniciansInquiry): string {
	return encodeURIComponent(JSON.stringify(filter));
}
