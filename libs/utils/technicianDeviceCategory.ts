import type { DeviceCategory, UserServiceItem } from '../types/fixora/fixora';

const ALL_CATEGORIES: DeviceCategory[] = ['IPHONE', 'IPAD', 'MACBOOK', 'APPLE_WATCH'];

const TEXT_MATCHERS: { category: DeviceCategory; test: (text: string) => boolean }[] = [
	{
		category: 'APPLE_WATCH',
		test: (text) => /apple\s*watch|applewatch|애플\s*워치|애플워치|\bwatch\b/i.test(text),
	},
	{ category: 'MACBOOK', test: (text) => /mac\s*book|macbook|맥북/i.test(text) },
	{ category: 'IPAD', test: (text) => /\bipad\b|아이패드/i.test(text) },
	{ category: 'IPHONE', test: (text) => /\biphone\b|아이폰/i.test(text) },
];

function matchCategoryInText(text: string): DeviceCategory | undefined {
	const normalized = text.trim();
	if (!normalized) return undefined;

	const enumKey = normalized.toUpperCase().replace(/\s+/g, '_');
	if (ALL_CATEGORIES.includes(enumKey as DeviceCategory)) {
		return enumKey as DeviceCategory;
	}

	for (const { category, test } of TEXT_MATCHERS) {
		if (test(normalized)) return category;
	}

	return undefined;
}

function collectCategories(texts: string[]): Set<DeviceCategory> {
	const matches = new Set<DeviceCategory>();
	for (const text of texts) {
		const category = matchCategoryInText(text);
		if (category) matches.add(category);
	}
	return matches;
}

/** Resolve a single device category when the technician clearly specializes in one Apple device type. */
export function resolveTechnicianDeviceCategory(input?: {
	specialty?: string | null;
	services?: UserServiceItem[] | null;
}): DeviceCategory | undefined {
	if (!input) return undefined;

	const texts = [input.specialty?.trim() ?? '', ...(input.services ?? []).map((service) => service.title.trim())].filter(
		Boolean,
	);
	const matches = collectCategories(texts);
	if (matches.size !== 1) return undefined;
	return [...matches][0];
}
