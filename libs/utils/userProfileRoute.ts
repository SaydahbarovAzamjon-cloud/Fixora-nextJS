import { isTechnicianUser } from './userRole';

export function getUserProfileHref(
	userId: string | null | undefined,
	currentUserId?: string | null,
	userType?: string | null,
	currentUserType?: string | null,
): string | null {
	if (!userId) return null;

	const isSelf = !!currentUserId && userId === currentUserId;
	const viewerIsTechnician = isTechnicianUser({ userType: currentUserType, memberType: currentUserType });

	if (isSelf && viewerIsTechnician) return '/technician/profile';
	if (isSelf) return '/mypage';
	if (userType === 'TECHNICIAN') return `/technicians/${userId}`;
	if (viewerIsTechnician) return `/technician/client/${userId}`;
	return `/member?memberId=${userId}`;
}
