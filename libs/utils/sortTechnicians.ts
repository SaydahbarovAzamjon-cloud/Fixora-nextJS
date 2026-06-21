import { TechnicianSummary, TechniciansInquiry } from '../types/fixora/fixora';

type SortGetter = (technician: TechnicianSummary) => number;

const SORT_GETTERS: Record<string, SortGetter> = {
	averageRating: (technician) => technician.averageRating ?? 0,
	completedJobsCount: (technician) => technician.completedJobsCount ?? 0,
	reviewCount: (technician) => technician.reviewCount ?? 0,
	createdAt: (technician) => new Date(technician.createdAt ?? 0).getTime(),
};

/** Client-side sort — ensures UI order when backend ignores `TechniciansInquiry.sort`. */
export function sortTechniciansList(
	list: TechnicianSummary[],
	inquiry: Pick<TechniciansInquiry, 'sort' | 'direction'>,
): TechnicianSummary[] {
	if (!list.length) return list;

	const sortKey = inquiry.sort ?? 'averageRating';
	const getter = SORT_GETTERS[sortKey] ?? SORT_GETTERS.averageRating;
	const sign = inquiry.direction === 'ASC' ? 1 : -1;

	return [...list].sort((a, b) => {
		const diff = getter(a) - getter(b);
		if (diff !== 0) return diff * sign;

		const ratingDiff = (b.averageRating ?? 0) - (a.averageRating ?? 0);
		if (ratingDiff !== 0) return ratingDiff;

		return (b.completedJobsCount ?? 0) - (a.completedJobsCount ?? 0);
	});
}
