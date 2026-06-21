import { Article } from '../types/fixora/fixora';
import { dateLocale } from './i18nLocale';
import {
	articleCategoryToCommunityFilter,
	communityCategoryLabelKey,
} from './communityCategories';

export const formatArticleCount = (value: number): string =>
	value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${value}`;

/** Real publish date from API `createdAt` — not relative time. */
export function formatArticlePublishedAt(
	createdAt?: string | null,
	locale?: string,
): string {
	if (!createdAt) return '';
	const date = new Date(createdAt);
	if (Number.isNaN(date.getTime())) return '';
	return date.toLocaleDateString(dateLocale(locale), {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

/** Tag pills from category label + optional author specialty (GAP-080 — no articleTags field). */
export function getArticleTagKeys(article: Article): string[] {
	const tags: string[] = [];
	if (article.articleCategory) {
		const filterId = articleCategoryToCommunityFilter(article.articleCategory);
		tags.push(communityCategoryLabelKey(filterId));
	}
	const specialty = article.authorData?.specialty?.trim();
	if (specialty) tags.push(specialty);
	return tags.slice(0, 3);
}
