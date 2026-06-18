import type { TFunction } from 'next-i18next';
import { dateLocale } from './i18nLocale';

export function formatTimeAgo(
	dateStr: string | null | undefined,
	t: TFunction,
	locale?: string,
): string {
	if (!dateStr) return '';
	const date = new Date(dateStr);
	const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
	if (minutes < 1) return t('time.justNow');
	if (minutes < 60) return t('time.minAgo', { count: minutes });
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return t('time.hAgo', { hours });
	const days = Math.floor(hours / 24);
	if (days < 7) return t('time.dAgo', { days });
	return date.toLocaleDateString(dateLocale(locale), { month: 'short', day: 'numeric' });
}

export function formatShortTimeAgo(dateStr: string | null | undefined, locale?: string): string {
	if (!dateStr) return '';
	const date = new Date(dateStr);
	const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
	if (minutes < 1) return 'now';
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d`;
	return date.toLocaleDateString(dateLocale(locale), { month: 'short', day: 'numeric' });
}

export function formatDueDate(
	dateStr: string | null | undefined,
	t: TFunction,
	locale?: string,
	createdAt?: string | null,
): string {
	let date: Date | null = null;
	let isEstimate = false;
	if (dateStr) {
		date = new Date(dateStr);
	} else if (createdAt) {
		date = new Date(createdAt);
		date.setDate(date.getDate() + 3);
		isEstimate = true;
	}
	if (!date || Number.isNaN(date.getTime())) return t('time.tbd');
	const now = new Date();
	const loc = dateLocale(locale);
	const time = date.toLocaleTimeString(loc, { hour: 'numeric', minute: '2-digit' });
	if (date.toDateString() === now.toDateString()) return t('time.today', { time });
	const tomorrow = new Date(now);
	tomorrow.setDate(now.getDate() + 1);
	if (date.toDateString() === tomorrow.toDateString()) return t('time.tomorrow', { time });
	const label = `${date.toLocaleDateString(loc, { month: 'short', day: 'numeric' })}, ${time}`;
	return isEstimate ? t('time.approx', { label }) : label;
}

export function formatClockTime(dateStr: string | null | undefined, locale?: string): string {
	if (!dateStr) return '--';
	return new Date(dateStr).toLocaleTimeString(dateLocale(locale), { hour: 'numeric', minute: '2-digit' });
}
