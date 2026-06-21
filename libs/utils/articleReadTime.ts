/** Estimate reading time from markdown/plain text (~200 wpm). */
export function estimateReadMinutes(text: string): number {
	const words = text.split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 200));
}

export function estimateArticleReadMinutes(article: {
	articleTitle?: string;
	articleExcerpt?: string | null;
	articleContent?: string | null;
}): number {
	const source =
		article.articleContent?.trim() ||
		[article.articleTitle, article.articleExcerpt].filter(Boolean).join(' ');
	return estimateReadMinutes(source);
}
