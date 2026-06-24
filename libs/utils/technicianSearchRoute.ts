import { TechniciansInquiry } from '../types/fixora/fixora';
import { serializeSearchPageQueryInput } from './technicianSearch';

const DEFAULT_SEARCH_INPUT: TechniciansInquiry = {
	page: 1,
	limit: 10,
	sort: 'averageRating',
	direction: 'DESC',
	search: { isOnline: null },
};

/** Build `/search` URL with getTechnicians text filter (FRONTEND_API TISearch.text). */
export function buildTechnicianSearchUrl(text?: string): string {
	const trimmed = text?.trim();
	const input: TechniciansInquiry = {
		...DEFAULT_SEARCH_INPUT,
		search: {
			isOnline: null,
			...(trimmed ? { text: trimmed } : {}),
		},
	};
	return `/search?input=${serializeSearchPageQueryInput(input)}`;
};
