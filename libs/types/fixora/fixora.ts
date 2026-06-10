/** Minimal Fixora summaries for homepage sections (full User/Article types arrive with P3-13). */

export type BadgeLevel = 'NEW' | 'VERIFIED' | 'PREMIUM_PRO';

export interface TechnicianSummary {
	_id: string;
	userNickname?: string;
	userFullName?: string;
	userProfileImage?: string;
	shopName?: string;
	specialty?: string;
	userLocation?: string;
	isOnline?: boolean;
	averageRating?: number;
	reviewCount?: number;
	completedJobsCount?: number;
	badgeLevel?: BadgeLevel;
}

export interface ArticleSummary {
	_id: string;
	articleCategory?: string;
	articleTitle: string;
	articleExcerpt?: string;
	articleImage?: string;
	articleLikes: number;
	articleViews: number;
	articleComments: number;
	createdAt: string;
	authorData?: {
		_id: string;
		userNickname?: string;
		userFullName?: string;
		userProfileImage?: string;
		specialty?: string;
	};
}

export interface TechniciansInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: 'ASC' | 'DESC';
	search: {
		deviceCategory?: string;
		isOnline?: boolean;
		minAverageRating?: number;
		text?: string;
		userLocation?: string;
	};
}

export interface ArticlesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: 'ASC' | 'DESC';
	search: {
		articleCategory?: string;
		text?: string;
		userId?: string;
	};
}
