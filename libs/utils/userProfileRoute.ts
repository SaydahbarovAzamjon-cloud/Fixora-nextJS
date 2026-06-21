import { isTechnicianUser } from './userRole';
import { CLIENT_MY_PAGE } from './clientMyPageRoute';

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
	if (isSelf) return CLIENT_MY_PAGE;
	if (userType === 'TECHNICIAN') return `/technicians/${userId}`;
	if (viewerIsTechnician) return `/technician/client/${userId}`;
	return `/member?memberId=${userId}`;
}
