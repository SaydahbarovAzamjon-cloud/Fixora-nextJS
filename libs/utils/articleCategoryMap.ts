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

export function repairCategoryToArticleCategory(id: RepairCategoryId): ArticleCategory {
	return REPAIR_TO_ARTICLE_CATEGORY[id];
}

const CATEGORY_TO_REPAIR: Record<ArticleCategory, RepairCategoryId> = {
	FREE: 'iphone',
	RECOMMEND: 'macbook',
	NEWS: 'ipad',
	HUMOR: 'apple_watch',
};

export function articleCategoryToRepairCategory(
	category?: ArticleCategory | null,
): RepairCategoryId {
	if (category && CATEGORY_TO_REPAIR[category]) return CATEGORY_TO_REPAIR[category];
	return 'macbook';
}
