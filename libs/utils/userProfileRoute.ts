export function getUserProfileHref(
	userId: string | null | undefined,
	currentUserId?: string | null,
	userType?: string | null,
): string | null {
	if (!userId) return null;
	if (currentUserId && userId === currentUserId) return '/mypage';
	// Follow + shop profile — technicians only (DECISIONS UI-09, BIZ-05)
	if (userType === 'TECHNICIAN') return `/technicians/${userId}`;
	// Clients (USER) — public profile with reviews they wrote
	return `/member?memberId=${userId}`;
}
