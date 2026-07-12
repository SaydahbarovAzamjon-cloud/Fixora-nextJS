import type { DeviceCategory, UserServiceItem } from '../types/fixora/fixora';

export const DEVICE_CATEGORY_OPTIONS: DeviceCategory[] = ['IPHONE', 'IPAD', 'MACBOOK', 'APPLE_WATCH'];

const TEXT_MATCHERS: { category: DeviceCategory; test: (text: string) => boolean }[] = [
	{
		category: 'APPLE_WATCH',
		test: (text) => /apple\s*watch|applewatch|애플\s*워치|애플워치|\bwatch\b/i.test(text),
	},
	{ category: 'MACBOOK', test: (text) => /mac\s*book|macbook|맥북/i.test(text) },
	{ category: 'IPAD', test: (text) => /\bipad\b|아이패드/i.test(text) },
	{ category: 'IPHONE', test: (text) => /\biphone\b|아이폰/i.test(text) },
];

export function matchDeviceCategoryInText(text: string): DeviceCategory | undefined {
	const normalized = text.trim();
	if (!normalized) return undefined;

	const enumKey = normalized.toUpperCase().replace(/\s+/g, '_');
	if (DEVICE_CATEGORY_OPTIONS.includes(enumKey as DeviceCategory)) {
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
		const category = matchDeviceCategoryInText(text);
		if (category) matches.add(category);
	}
	return matches;
}

/** Selected repair device categories from `specialty` + optional `services` titles. */
export function parseTechnicianDeviceCategories(input?: {
	specialty?: string | null;
	services?: UserServiceItem[] | null;
}): DeviceCategory[] {
	if (!input) return [];

	const matched = new Set<DeviceCategory>();
	const specialtyParts = (input.specialty ?? '')
		.split(/[,;|]/)
		.map((part) => part.trim())
		.filter(Boolean);

	for (const part of specialtyParts) {
		const category = matchDeviceCategoryInText(part);
		if (category) matched.add(category);
	}

	for (const service of input.services ?? []) {
		const category = matchDeviceCategoryInText(service.title);
		if (category) matched.add(category);
	}

	return DEVICE_CATEGORY_OPTIONS.filter((category) => matched.has(category));
}

/** Persist device categories in the backend `specialty` string field. */
export function formatTechnicianSpecialtyField(categories: readonly DeviceCategory[]): string {
	return categories.join(', ');
}

export function toggleDeviceCategory(
	current: DeviceCategory[],
	category: DeviceCategory,
): DeviceCategory[] {
	return current.includes(category)
		? current.filter((item) => item !== category)
		: [...current, category];
}

type BookingCategorySource = {
	bookingStatus?: string | null;
	deviceData?: { deviceCategory?: string | null } | null;
	aiClassification?: { deviceType?: string | null } | null;
};

/** Count completed jobs per device category from technician bookings. */
export function countCompletedJobsByCategory(
	bookings: BookingCategorySource[],
): Partial<Record<DeviceCategory, number>> {
	const counts: Partial<Record<DeviceCategory, number>> = {};
	for (const booking of bookings) {
		if (booking.bookingStatus !== 'COMPLETED') continue;
		const raw = booking.deviceData?.deviceCategory ?? booking.aiClassification?.deviceType;
		if (!raw) continue;
		const category = matchDeviceCategoryInText(String(raw));
		if (!category) continue;
		counts[category] = (counts[category] ?? 0) + 1;
	}
	return counts;
}

/** Resolve a single device category when the technician clearly specializes in one Apple device type. */
export function resolveTechnicianDeviceCategory(input?: {
	specialty?: string | null;
	services?: UserServiceItem[] | null;
}): DeviceCategory | undefined {
	const categories = parseTechnicianDeviceCategories(input);
	if (categories.length !== 1) return undefined;
	return categories[0];
}
