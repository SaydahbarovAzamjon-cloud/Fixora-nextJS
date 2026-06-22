import type { AdminUser } from '../types/admin/admin';

export interface CompletenessItem {
	key: string;
	labelKey: string;
	done: boolean;
}

export function buildVerificationCompleteness(user: AdminUser): CompletenessItem[] {
	const hasPhoto = Boolean(user.userProfileImage && !user.userProfileImage.includes('defaultUser'));
	const hasServices = (user.services?.length ?? 0) > 0;
	const hasBio = Boolean(user.userBio?.trim());
	const hasHours = Boolean(user.workingHours?.days?.length);
	const hasDocs = (user.verificationDocuments?.length ?? 0) > 0;

	return [
		{ key: 'photo', labelKey: 'verification.completeness.photo', done: hasPhoto },
		{ key: 'services', labelKey: 'verification.completeness.services', done: hasServices },
		{ key: 'bio', labelKey: 'verification.completeness.bio', done: hasBio },
		{ key: 'hours', labelKey: 'verification.completeness.hours', done: hasHours },
		{ key: 'docs', labelKey: 'verification.completeness.docs', done: hasDocs },
	];
}

export function completenessPercent(items: CompletenessItem[]): number {
	if (!items.length) return 0;
	return Math.round((items.filter((i) => i.done).length / items.length) * 100);
}
