import type { UserWorkingHours } from '../types/fixora/fixora';

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

function sortDays(days: string[]): string[] {
	return [...days]
		.filter((day) => DAY_ORDER.includes(day as (typeof DAY_ORDER)[number]))
		.sort((a, b) => DAY_ORDER.indexOf(a as (typeof DAY_ORDER)[number]) - DAY_ORDER.indexOf(b as (typeof DAY_ORDER)[number]));
}

function compressDays(days: string[]): string {
	if (days.length === 0) return '';
	if (days.length === 1) return days[0];

	const indices = days.map((day) => DAY_ORDER.indexOf(day as (typeof DAY_ORDER)[number]));
	let rangeStart = 0;
	const ranges: string[] = [];

	for (let i = 1; i <= indices.length; i += 1) {
		if (i === indices.length || indices[i] !== indices[i - 1] + 1) {
			const start = days[rangeStart];
			const end = days[i - 1];
			ranges.push(start === end ? start : `${start}–${end}`);
			rangeStart = i;
		}
	}

	return ranges.join(', ');
}

/** Compact summary for booking detail / cards — e.g. "Mon–Fri · 8:00 AM – 6:00 PM". */
export function formatTechnicianWorkingHours(workingHours?: UserWorkingHours | null): string | null {
	if (!workingHours?.days?.length) return null;

	const days = sortDays(workingHours.days);
	if (days.length === 0) return null;

	const daysPart = compressDays(days);
	const { startTime, endTime } = workingHours;

	if (startTime && endTime) {
		return `${daysPart} · ${startTime} – ${endTime}`;
	}

	return daysPart;
}
