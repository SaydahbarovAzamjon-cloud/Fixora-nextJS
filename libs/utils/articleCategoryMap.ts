import { ArticleCategory } from '../types/fixora/fixora';

/** UI pill ids — mapped to legacy ArticleCategory enum (GAP-080). */
export type RepairCategoryId = 'iphone' | 'macbook' | 'ipad' | 'apple_watch';

export const REPAIR_CATEGORY_IDS: RepairCategoryId[] = ['iphone', 'macbook', 'ipad', 'apple_watch'];

export const REPAIR_TO_ARTICLE_CATEGORY: Record<RepairCategoryId, ArticleCategory> = {
	iphone: 'FREE',
	macbook: 'RECOMMEND',
	ipad: 'NEWS',
	apple_watch: 'HUMOR',
};

export const REPAIR_TO_DEVICE_CATEGORY: Record<RepairCategoryId, string> = {
	iphone: 'IPHONE',
	macbook: 'MACBOOK',
	ipad: 'IPAD',
	apple_watch: 'APPLE_WATCH',
};

const DEVICE_TO_REPAIR: Record<string, RepairCategoryId> = {
	IPHONE: 'iphone',
	MACBOOK: 'macbook',
	IPAD: 'ipad',
	APPLE_WATCH: 'apple_watch',
};

export function repairCategoryToDeviceCategory(id: RepairCategoryId): string {
	return REPAIR_TO_DEVICE_CATEGORY[id];
}

export function repairCategoryToArticleCategory(id: RepairCategoryId): ArticleCategory {
	return REPAIR_TO_ARTICLE_CATEGORY[id];
}

const CATEGORY_TO_REPAIR: Partial<Record<ArticleCategory, RepairCategoryId>> = {
	FREE: 'iphone',
	RECOMMEND: 'macbook',
	NEWS: 'ipad',
	HUMOR: 'apple_watch',
};

export function deviceCategoryToRepairCategory(category?: string | null): RepairCategoryId {
	if (category && DEVICE_TO_REPAIR[category]) return DEVICE_TO_REPAIR[category];
	return 'macbook';
}

export function articleCategoryToRepairCategory(
	category?: ArticleCategory | null,
): RepairCategoryId {
	if (category && CATEGORY_TO_REPAIR[category]) return CATEGORY_TO_REPAIR[category]!;
	return 'macbook';
}
