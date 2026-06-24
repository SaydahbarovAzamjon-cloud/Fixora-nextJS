/**
 * @deprecated Use types from `libs/types/fixora/fixora.ts`.
 */
import { TotalCounter } from '../property/property';
import type { Article, ArticleCategory, ArticleStatus } from '../fixora/fixora';

export type BoardArticle = Article;
export type BoardArticleCategory = ArticleCategory;
export type BoardArticleStatus = ArticleStatus;

export interface BoardArticles {
	list: BoardArticle[];
	metaCounter: TotalCounter[];
}
