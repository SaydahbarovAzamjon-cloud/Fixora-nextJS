import { TechnicianSummary } from '../types/fixora/fixora';
import { sortTechniciansList } from './sortTechnicians';

export const DISCOVERY_POOL_LIMIT = 100;
export const DISCOVERY_SECTION_LIMIT = 8;
export const MIN_REVIEWS_TOP_RATED = 3;
export const FAST_RESPONDER_MAX_MINUTES = 15;

export const FAST_RESPONDERS_INPUT = {
	page: 1,
	limit: DISCOVERY_SECTION_LIMIT,
	sort: 'avgResponseMinutes',
	direction: 'ASC' as const,
	search: { isOnline: null, maxAvgResponseMinutes: FAST_RESPONDER_MAX_MINUTES },
};

export const DISCOVERY_SECTION_IDS = [
	'trending',
	'topRated',
	'mostReviewed',
	'fastResponders',
	'newTechnicians',
	'verified',
] as const;

export type DiscoverySectionId = (typeof DISCOVERY_SECTION_IDS)[number];

export interface DiscoverySection {
	id: DiscoverySectionId;
	titleKey: string;
	technicians: TechnicianSummary[];
}

const VERIFIED_BADGES = new Set(['VERIFIED', 'PREMIUM_PRO']);

function takeTop(list: TechnicianSummary[], limit = DISCOVERY_SECTION_LIMIT): TechnicianSummary[] {
	return list.slice(0, limit);
}

/** Engagement proxy until review/booking growth APIs exist (see BACKEND_GAPS). */
export function trendingEngagementScore(technician: TechnicianSummary): number {
	const reviewCount = technician.reviewCount ?? 0;
	const completedJobs = technician.completedJobsCount ?? 0;
	const rating = technician.averageRating ?? 0;
	const followers = technician.followersCount ?? 0;
	const onlineBoost = technician.isOnline ? 10 : 0;

	return reviewCount * 3 + completedJobs * 2 + rating * 15 + followers + onlineBoost;
}

/** Response-time proxy when avgResponseMinutes is unavailable (GAP-030). */
export function fastResponderScore(technician: TechnicianSummary): number {
	const onlineBoost = technician.isOnline ? 100 : 0;
	const rating = technician.averageRating ?? 0;
	const completedJobs = Math.min(technician.completedJobsCount ?? 0, 50);

	return onlineBoost + rating * 20 + completedJobs;
}

export function buildTrendingSection(list: TechnicianSummary[]): TechnicianSummary[] {
	return takeTop(
		[...list].sort((a, b) => trendingEngagementScore(b) - trendingEngagementScore(a)),
	);
}

export function buildTopRatedSection(list: TechnicianSummary[]): TechnicianSummary[] {
	const eligible = list.filter((tech) => (tech.reviewCount ?? 0) >= MIN_REVIEWS_TOP_RATED);
	return takeTop(
		sortTechniciansList(eligible, { sort: 'averageRating', direction: 'DESC' }),
	);
}

export function buildMostReviewedSection(list: TechnicianSummary[]): TechnicianSummary[] {
	return takeTop(
		sortTechniciansList(list, { sort: 'reviewCount', direction: 'DESC' }),
	);
}

export function buildFastRespondersSection(list: TechnicianSummary[]): TechnicianSummary[] {
	const withResponse = list.filter((tech) => tech.avgResponseMinutes != null);
	if (withResponse.length > 0) {
		return takeTop(
			sortTechniciansList(withResponse, { sort: 'avgResponseMinutes', direction: 'ASC' }),
		);
	}
	return takeTop(
		[...list].sort((a, b) => fastResponderScore(b) - fastResponderScore(a)),
	);
}

export function buildNewTechniciansSection(list: TechnicianSummary[]): TechnicianSummary[] {
	return takeTop(
		sortTechniciansList(list, { sort: 'createdAt', direction: 'DESC' }),
	);
}

export function buildVerifiedSection(list: TechnicianSummary[]): TechnicianSummary[] {
	const verified = list.filter((tech) => VERIFIED_BADGES.has(tech.badgeLevel ?? ''));
	return takeTop(
		sortTechniciansList(verified, { sort: 'averageRating', direction: 'DESC' }),
	);
}

const SECTION_BUILDERS: Record<DiscoverySectionId, (list: TechnicianSummary[]) => TechnicianSummary[]> = {
	trending: buildTrendingSection,
	topRated: buildTopRatedSection,
	mostReviewed: buildMostReviewedSection,
	fastResponders: buildFastRespondersSection,
	newTechnicians: buildNewTechniciansSection,
	verified: buildVerifiedSection,
};

const SECTION_TITLE_KEYS: Record<DiscoverySectionId, string> = {
	trending: 'technicians.sections.trending',
	topRated: 'technicians.sections.topRated',
	mostReviewed: 'technicians.sections.mostReviewed',
	fastResponders: 'technicians.sections.fastResponders',
	newTechnicians: 'technicians.sections.newTechnicians',
	verified: 'technicians.sections.verified',
};

export function buildDiscoverySections(
	list: TechnicianSummary[],
	overrides?: Partial<Record<DiscoverySectionId, TechnicianSummary[]>>,
): DiscoverySection[] {
	return DISCOVERY_SECTION_IDS.map((id) => ({
		id,
		titleKey: SECTION_TITLE_KEYS[id],
		technicians: overrides?.[id] ?? SECTION_BUILDERS[id](list),
	})).filter((section) => section.technicians.length > 0);
}
