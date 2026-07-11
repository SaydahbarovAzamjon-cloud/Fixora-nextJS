import {
	SERVICE_DEVICE_CATEGORY,
	SERVICE_ISSUE_CATEGORY,
	SERVICES,
} from '../components/search/categoryMappings';
import { DEFAULT_GEO_SEARCH_RADIUS_KM } from '../kakao-maps';
import type { TechniciansInquiry } from '../types/fixora/fixora';

const VALID_ISSUE_CATEGORIES = new Set([
	'BATTERY',
	'CAMERA',
	'CHARGING',
	'GENERAL',
	'KEYBOARD',
	'SCREEN',
	'SOFTWARE',
	'WATER_DAMAGE',
]);

const VALID_DEVICE_CATEGORIES = new Set(['IPHONE', 'MACBOOK', 'IPAD', 'APPLE_WATCH']);

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

export function normalizeTechniciansInquiry(filter: TechniciansInquiry): TechniciansInquiry {
	const {
		text,
		issueCategory,
		deviceCategory,
		latitude,
		longitude,
		radiusKm,
		isOnline,
		minAverageRating,
		maxAvgResponseMinutes,
		userLocation,
		...rest
	} = filter.search;

	const search: TechniciansInquiry['search'] = { ...rest };

	if (isOnline === true || isOnline === false) {
		search.isOnline = isOnline;
	} else {
		search.isOnline = null;
	}

	const trimmedText = text?.trim();
	if (trimmedText) search.text = trimmedText;
	if (issueCategory && VALID_ISSUE_CATEGORIES.has(issueCategory)) {
		search.issueCategory = issueCategory;
	}
	if (deviceCategory && VALID_DEVICE_CATEGORIES.has(deviceCategory)) {
		search.deviceCategory = deviceCategory;
	}
	if (latitude != null && Number.isFinite(latitude)) search.latitude = latitude;
	if (longitude != null && Number.isFinite(longitude)) search.longitude = longitude;
	if (latitude != null && longitude != null && Number.isFinite(latitude) && Number.isFinite(longitude)) {
		const resolvedRadius =
			radiusKm != null && Number.isFinite(radiusKm) ? radiusKm : DEFAULT_GEO_SEARCH_RADIUS_KM;
		search.radiusKm = Math.max(resolvedRadius, DEFAULT_GEO_SEARCH_RADIUS_KM);
	}
	if (minAverageRating != null && Number.isFinite(minAverageRating)) {
		search.minAverageRating = minAverageRating;
	}
	if (maxAvgResponseMinutes != null && Number.isFinite(maxAvgResponseMinutes)) {
		search.maxAvgResponseMinutes = maxAvgResponseMinutes;
	}
	const trimmedLocation = userLocation?.trim();
	if (trimmedLocation) search.userLocation = trimmedLocation;

	return {
		...filter,
		page: Math.max(1, filter.page || 1),
		limit: filter.limit || 10,
		sort: filter.sort,
		direction: filter.direction,
		search,
	};
}

/** Strip empty/null fields before GraphQL variables (avoids backend validation errors). */
export function prepareTechniciansQueryInput(filter: TechniciansInquiry): TechniciansInquiry {
	const processed = getTechniciansResultsInput(normalizeTechniciansInquiry(filter));
	const search: TechniciansInquiry['search'] = {};

	for (const [key, value] of Object.entries(processed.search) as [keyof TechniciansInquiry['search'], unknown][]) {
		// userLocation in TISearch is a regex on technician profiles — not the map/GPS label (MAP-01).
		if (key === 'userLocation') continue;
		if (value === undefined || value === null || value === '') continue;
		search[key] = value as never;
	}

	if (processed.search.isOnline === null) {
		search.isOnline = null;
	}

	return {
		...processed,
		search: Object.keys(search).length > 0 ? search : { isOnline: null },
	};
}

export function techniciansInquiryEqual(a: TechniciansInquiry, b: TechniciansInquiry): boolean {
	return JSON.stringify(normalizeTechniciansInquiry(a)) === JSON.stringify(normalizeTechniciansInquiry(b));
}

/**
 * Main search results — combine discovery filters with geo when the user picked a map point (MAP-01).
 */
export function getTechniciansResultsInput(filter: TechniciansInquiry): TechniciansInquiry {
	const normalized = normalizeTechniciansInquiry(filter);
	const { text, issueCategory, deviceCategory, latitude, longitude, radiusKm, userLocation, ...rest } =
		normalized.search;
	const hasDiscoveryFilter = Boolean(text?.trim() || issueCategory || deviceCategory);
	const hasGeoFilter =
		latitude != null && longitude != null && Number.isFinite(latitude) && Number.isFinite(longitude);

	if (!hasDiscoveryFilter) return normalized;

	return {
		...normalized,
		search: {
			...rest,
			text: text?.trim() || undefined,
			issueCategory,
			deviceCategory,
			isOnline: normalized.search.isOnline ?? null,
			...(hasGeoFilter
				? {
						latitude,
						longitude,
						radiusKm: radiusKm ?? DEFAULT_GEO_SEARCH_RADIUS_KM,
					}
				: {}),
		},
	};
}

export function hasActiveGeoSearch(filter: TechniciansInquiry): boolean {
	const { latitude, longitude } = filter.search;
	return latitude != null && longitude != null && Number.isFinite(latitude) && Number.isFinite(longitude);
}

export function parseSearchPageQueryInput(raw: string): TechniciansInquiry {
	try {
		return JSON.parse(decodeURIComponent(raw)) as TechniciansInquiry;
	} catch {
		return JSON.parse(raw) as TechniciansInquiry;
	}
}

export function serializeSearchPageQueryInput(filter: TechniciansInquiry): string {
	return encodeURIComponent(JSON.stringify(normalizeTechniciansInquiry(filter)));
}
