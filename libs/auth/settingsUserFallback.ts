import { CustomJwtPayload } from '../types/customJwtPayload';
import { TechnicianSettingsUser } from '../hooks/useTechnicianSettings';
import { readStoredProfileImage } from './syncUserVar';
import { readStoredUserEmail } from './technicianSettingsCache';

/** Build settings form source from JWT userVar when GraphQL is temporarily unavailable. */
export function settingsUserFromAuth(auth: Partial<CustomJwtPayload> | null | undefined): TechnicianSettingsUser | null {
	if (!auth?._id) return null;

	const storedImage = readStoredProfileImage(auth._id);
	const storedEmail = readStoredUserEmail(auth._id);
	return {
		_id: auth._id,
		userEmail: storedEmail ?? '',
		userFullName: auth.memberFullName ?? auth.userFullName ?? '',
		userNickname: auth.memberNick ?? auth.userNickname ?? '',
		userPhoneNumber: auth.memberPhone ?? '',
		userLocation: auth.memberAddress ?? '',
		userBio: auth.memberDesc ?? '',
		userProfileImage: storedImage ?? auth.memberImage ?? auth.userProfileImage ?? '',
		userType: auth.userType ?? auth.memberType ?? '',
	};
}