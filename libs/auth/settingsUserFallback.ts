import { CustomJwtPayload } from '../types/customJwtPayload';
import { TechnicianSettingsUser } from '../hooks/useTechnicianSettings';
import { readStoredProfileImage } from './syncUserVar';
import { readStoredUserEmail, readTechnicianSettingsCache } from './technicianSettingsCache';

function firstNonEmpty(...values: (string | null | undefined)[]): string {
	for (const value of values) {
		if (value?.trim()) return value.trim();
	}
	return '';
}

/** Build settings form source from JWT userVar when GraphQL is temporarily unavailable. */
export function settingsUserFromAuth(auth: Partial<CustomJwtPayload> | null | undefined): TechnicianSettingsUser | null {
	if (!auth?._id) return null;

	const cached = readTechnicianSettingsCache(auth._id);
	const storedImage = readStoredProfileImage(auth._id);
	const storedEmail = readStoredUserEmail(auth._id);
	return {
		_id: auth._id,
		userEmail: firstNonEmpty(cached?.userEmail, storedEmail, auth.userEmail),
		userFullName: firstNonEmpty(cached?.userFullName, auth.memberFullName, auth.userFullName),
		userNickname: firstNonEmpty(cached?.userNickname, auth.memberNick, auth.userNickname),
		userSlug: cached?.userSlug ?? null,
		shopName: cached?.shopName ?? null,
		userPhoneNumber: firstNonEmpty(cached?.userPhoneNumber, auth.memberPhone),
		userLocation: firstNonEmpty(cached?.userLocation, auth.memberAddress),
		userBio: firstNonEmpty(cached?.userBio, auth.memberDesc),
		userProfileImage: firstNonEmpty(storedImage, cached?.userProfileImage, auth.memberImage, auth.userProfileImage),
		userType: cached?.userType ?? auth.userType ?? auth.memberType ?? '',
		badgeLevel: cached?.badgeLevel ?? null,
		specialty: cached?.specialty ?? null,
		services: cached?.services ?? null,
		workingHours: cached?.workingHours ?? null,
	};
}