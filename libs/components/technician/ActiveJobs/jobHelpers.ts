import type { TFunction } from 'next-i18next';
import { dateLocale } from '../../../utils/i18nLocale';

export type JobStage = 'DIAGNOSING' | 'IN_PROGRESS' | 'PARTS_ORDERED' | 'READY_FOR_PICKUP';

const STAGE_COLORS: Record<JobStage, { color: string; bg: string }> = {
	DIAGNOSING: { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
	IN_PROGRESS: { color: '#8e1428', bg: 'rgba(115, 12, 30, 0.12)' },
	PARTS_ORDERED: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
	READY_FOR_PICKUP: { color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
};

const STAGE_LABEL_KEYS: Record<JobStage, string> = {
	DIAGNOSING: 'jobs.stage.diagnosing',
	IN_PROGRESS: 'jobs.stage.inProgress',
	PARTS_ORDERED: 'jobs.stage.partsOrdered',
	READY_FOR_PICKUP: 'jobs.stage.readyForPickup',
};

export const getJobStageInfo = (stage: JobStage, t: TFunction) => ({
	label: t(STAGE_LABEL_KEYS[stage]),
	...STAGE_COLORS[stage],
});

/** @deprecated use getJobStageInfo(stage, t) */
export const JOB_STAGE_INFO: Record<JobStage, { label: string; color: string; bg: string }> = {
	DIAGNOSING: { label: 'Diagnosing', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
	IN_PROGRESS: { label: 'In Progress', color: '#8e1428', bg: 'rgba(115, 12, 30, 0.12)' },
	PARTS_ORDERED: { label: 'Parts Ordered', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
	READY_FOR_PICKUP: { label: 'Ready for Pickup', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
};

export const getJobProgress = (booking: any): number => {
	if (booking?.bookingStatus === 'COMPLETED') return 100;
	if (booking?.bookingStatus === 'ACCEPTED') return 10;
	const steps = booking?.progressUpdates?.length ?? 0;
	return Math.min(95, 20 + steps * 20);
};

export const getJobStage = (booking: any): JobStage => {
	if (booking?.bookingStatus === 'ACCEPTED') return 'DIAGNOSING';
	const progress = getJobProgress(booking);
	if (progress >= 95) return 'READY_FOR_PICKUP';
	if (progress < 40) return 'PARTS_ORDERED';
	return 'IN_PROGRESS';
};

const DEVICE_ICON: Record<string, string> = {
	IPHONE: '📱',
	APPLE_WATCH: '⌚',
	IPAD: '📱',
	MACBOOK: '💻',
};

const DEVICE_LABEL: Record<string, string> = {
	IPHONE: 'iPhone',
	APPLE_WATCH: 'Apple Watch',
	IPAD: 'iPad',
	MACBOOK: 'MacBook',
};

export const deviceIcon = (deviceType?: string | null) => DEVICE_ICON[deviceType ?? ''] ?? '🔧';
export const deviceLabel = (deviceType?: string | null) => DEVICE_LABEL[deviceType ?? ''] ?? 'Device';

const TIMELINE_KEYS = [
	'jobs.timeline.received',
	'jobs.timeline.diagnosis',
	'jobs.timeline.partsOrdered',
	'jobs.timeline.repairInProgress',
	'jobs.timeline.qualityTesting',
	'jobs.timeline.readyForPickup',
] as const;

export const buildTimeline = (booking: any, t: TFunction) => {
	const isCompleted = booking?.bookingStatus === 'COMPLETED';
	const updates = booking?.progressUpdates ?? [];
	const doneCount = isCompleted
		? TIMELINE_KEYS.length
		: Math.min(TIMELINE_KEYS.length, 1 + updates.length);

	return TIMELINE_KEYS.map((key, idx) => {
		let timestamp: string | null = null;
		if (idx === 0) timestamp = booking?.createdAt ?? null;
		else if (idx - 1 < updates.length) timestamp = updates[idx - 1]?.timestamp ?? null;
		else if (isCompleted && idx === TIMELINE_KEYS.length - 1) timestamp = booking?.completedAt ?? null;

		return {
			label: t(key),
			done: idx < doneCount,
			timestamp,
		};
	});
};

export const formatDateTime = (dateStr?: string | null, locale?: string) => {
	if (!dateStr) return '';
	const date = new Date(dateStr);
	const loc = dateLocale(locale);
	return date.toLocaleDateString(loc, { month: 'short', day: 'numeric' }) +
		', ' + date.toLocaleTimeString(loc, { hour: 'numeric', minute: '2-digit' });
};

export const formatDue = (dateStr?: string | null, t?: TFunction, locale?: string) => {
	if (!dateStr) return t ? t('time.tbd') : 'TBD';
	const date = new Date(dateStr);
	const now = new Date();
	const loc = dateLocale(locale);
	const time = date.toLocaleTimeString(loc, { hour: 'numeric', minute: '2-digit' });
	if (date.toDateString() === now.toDateString()) {
		return t ? t('time.today', { time }) : `Today, ${time}`;
	}
	const tomorrow = new Date(now);
	tomorrow.setDate(now.getDate() + 1);
	if (date.toDateString() === tomorrow.toDateString()) {
		return t ? t('time.tomorrow', { time }) : `Tomorrow, ${time}`;
	}
	return `${date.toLocaleDateString(loc, { month: 'short', day: 'numeric' })}, ${time}`;
};
