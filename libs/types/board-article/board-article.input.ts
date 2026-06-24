/**
 * @deprecated Use `ArticlesInquiry` / `ArticleInput` from `libs/types/fixora/fixora.ts`.
 */
import { Direction } from '../../enums/common.enum';
import { ArticleCategory, ArticleStatus, ArticlesInquiry, ArticleInput } from '../fixora/fixora';

export type BoardArticleCategory = ArticleCategory;
export type BoardArticleStatus = ArticleStatus;

export type BoardArticleInput = ArticleInput;
export type BoardArticlesInquiry = ArticlesInquiry;

export interface AllBoardArticlesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: {
		articleStatus?: ArticleStatus;
		articleCategory?: ArticleCategory;
	};
}
