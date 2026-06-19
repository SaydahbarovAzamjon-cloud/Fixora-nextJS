import { CustomJwtPayload } from '../types/customJwtPayload';
import { TechnicianSettingsUser } from '../hooks/useTechnicianSettings';

/** Build settings form source from JWT userVar when GraphQL is temporarily unavailable. */
export function settingsUserFromAuth(auth: CustomJwtPayload | null | undefined): TechnicianSettingsUser | null {
	if (!auth?._id) return null;
	return {
		_id: auth._id,
		userFullName: auth.memberFullName ?? auth.userFullName ?? '',
		userNickname: auth.memberNick ?? auth.userNickname ?? '',
		userPhoneNumber: auth.memberPhone ?? '',
		userLocation: auth.memberAddress ?? '',
		userBio: auth.memberDesc ?? '',
		userProfileImage: auth.memberImage ?? auth.userProfileImage ?? '',
		userType: auth.userType ?? auth.memberType ?? '',
	};
}
