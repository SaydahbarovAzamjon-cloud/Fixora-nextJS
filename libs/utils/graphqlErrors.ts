import { Message } from '../enums/common.enum';

/** Backend throws this when a single-record lookup misses (e.g. unapproved technician on public getUser). */
export function isNoDataFoundGraphQLError(message?: string | null): boolean {
	if (!message) return false;
	const normalized = message.replace(/^Definer:\s*/i, '').trim();
	return normalized === Message.NO_DATA_FOUND || /no data found/i.test(normalized);
}
