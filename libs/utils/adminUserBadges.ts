import type { AdminUser } from '../types/admin/admin';

export type AdminUserBadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'purple' | 'blue' | 'yellow';

export type AdminUserBadgeKind = 'VERIFIED' | 'PREMIUM_PRO' | 'SUSPENDED' | 'BLOCKED';

export interface AdminUserBadgeItem {
	kind: AdminUserBadgeKind;
	labelKey: string;
	tone: AdminUserBadgeTone;
}

export function getAdminUserBadges(user: Pick<AdminUser, 'badgeLevel' | 'isVerified' | 'userStatus' | 'isBlocked'>): AdminUserBadgeItem[] {
	const badges: AdminUserBadgeItem[] = [];

	if (user.badgeLevel === 'VERIFIED' || user.isVerified) {
		badges.push({ kind: 'VERIFIED', labelKey: 'userDetail.badges.VERIFIED', tone: 'blue' });
	}
	if (user.badgeLevel === 'PREMIUM_PRO') {
		badges.push({ kind: 'PREMIUM_PRO', labelKey: 'userDetail.badges.PREMIUM_PRO', tone: 'purple' });
	}
	if (user.userStatus === 'BLOCK') {
		badges.push({ kind: 'SUSPENDED', labelKey: 'userDetail.badges.SUSPENDED', tone: 'warning' });
	}
	if (user.isBlocked) {
		badges.push({ kind: 'BLOCKED', labelKey: 'userDetail.badges.BLOCKED', tone: 'danger' });
	}

	return badges;
}
