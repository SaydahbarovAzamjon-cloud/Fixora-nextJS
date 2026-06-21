import { ArticleCategory } from '../types/fixora/fixora';

/** Community hub filter ids — mapped to legacy ArticleCategory enum (GAP-080). */
export type CommunityCategoryId =
	| 'all'
	| 'repair_guides'
	| 'quick_tips'
	| 'troubleshooting'
	| 'success_stories'
	| 'expert_articles';

export const COMMUNITY_CATEGORY_IDS: CommunityCategoryId[] = [
	'all',
	'repair_guides',
	'quick_tips',
	'troubleshooting',
	'success_stories',
	'expert_articles',
];

const FILTER_TO_ARTICLE_CATEGORY: Record<
	Exclude<CommunityCategoryId, 'all'>,
	ArticleCategory
> = {
	repair_guides: 'FREE',
	quick_tips: 'RECOMMEND',
	troubleshooting: 'NEWS',
	success_stories: 'HUMOR',
	expert_articles: 'RECOMMEND',
};

const ARTICLE_CATEGORY_TO_FILTER: Record<ArticleCategory, Exclude<CommunityCategoryId, 'all'>> = {
	FREE: 'repair_guides',
	RECOMMEND: 'quick_tips',
	NEWS: 'troubleshooting',
	HUMOR: 'success_stories',
};

export function communityFilterToArticleCategory(
	filter: CommunityCategoryId,
): ArticleCategory | undefined {
	if (filter === 'all') return undefined;
	return FILTER_TO_ARTICLE_CATEGORY[filter];
}

export function articleCategoryToCommunityFilter(
	category?: ArticleCategory | null,
): Exclude<CommunityCategoryId, 'all'> {
	if (category && ARTICLE_CATEGORY_TO_FILTER[category]) {
		return ARTICLE_CATEGORY_TO_FILTER[category];
	}
	return 'repair_guides';
}

export function communityCategoryLabelKey(filter: CommunityCategoryId): string {
	return `community.categories.${filter}`;
}
