export type JobStage = 'DIAGNOSING' | 'IN_PROGRESS' | 'PARTS_ORDERED' | 'READY_FOR_PICKUP';

export const JOB_STAGE_INFO: Record<JobStage, { label: string; color: string; bg: string }> = {
	DIAGNOSING: { label: 'Diagnosing', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
	IN_PROGRESS: { label: 'In Progress', color: '#FF6B00', bg: 'rgba(255,107,0,0.12)' },
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

export const REPAIR_TIMELINE_STEPS = [
	'Received & Logged',
	'Initial Diagnosis',
	'Parts Ordered',
	'Repair In Progress',
	'Quality Testing',
	'Ready for Pickup',
];

export const formatDateTime = (dateStr?: string | null) => {
	if (!dateStr) return '';
	const date = new Date(dateStr);
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
		', ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export const formatDue = (dateStr?: string | null) => {
	if (!dateStr) return 'TBD';
	const date = new Date(dateStr);
	const now = new Date();
	const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
	if (date.toDateString() === now.toDateString()) return `Today, ${time}`;
	const tomorrow = new Date(now);
	tomorrow.setDate(now.getDate() + 1);
	if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${time}`;
	return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`;
};

export const buildTimeline = (booking: any) => {
	const isCompleted = booking?.bookingStatus === 'COMPLETED';
	const updates = booking?.progressUpdates ?? [];
	const doneCount = isCompleted
		? REPAIR_TIMELINE_STEPS.length
		: Math.min(REPAIR_TIMELINE_STEPS.length, 1 + updates.length);

	return REPAIR_TIMELINE_STEPS.map((label, idx) => {
		let timestamp: string | null = null;
		if (idx === 0) timestamp = booking?.createdAt ?? null;
		else if (idx - 1 < updates.length) timestamp = updates[idx - 1]?.timestamp ?? null;
		else if (isCompleted && idx === REPAIR_TIMELINE_STEPS.length - 1) timestamp = booking?.completedAt ?? null;

		return {
			label,
			done: idx < doneCount,
			timestamp,
		};
	});
};
