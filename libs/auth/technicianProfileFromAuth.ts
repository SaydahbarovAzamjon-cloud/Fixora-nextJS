import { CustomJwtPayload } from '../types/customJwtPayload';
import { TechnicianProfile } from '../types/fixora/fixora';
import { readStoredProfileImage } from './syncUserVar';
import { readTechnicianSettingsCache } from './technicianSettingsCache';

/**
 * Build a minimal technician profile from JWT / userVar when public `getUser` is unavailable.
 * Public `getUser` only returns APPROVED technicians; new signups are PENDING (FRONTEND_API.md).
 */
export function technicianProfileFromAuth(
	auth: Partial<CustomJwtPayload> | null | undefined,
): TechnicianProfile | null {
	if (!auth?._id) return null;
	const role = auth.userType ?? auth.memberType;
	if (role !== 'TECHNICIAN') return null;

	const storedImage = readStoredProfileImage(auth._id);
	const cached = readTechnicianSettingsCache(auth._id);

	return {
		_id: auth._id,
		userFullName: auth.userFullName ?? auth.memberFullName ?? '',
		userNickname: auth.userNickname ?? auth.memberNick ?? '',
		userProfileImage: storedImage ?? auth.userProfileImage ?? auth.memberImage ?? '',
		userBio: cached?.userBio ?? auth.memberDesc ?? '',
		userLocation: cached?.userLocation ?? auth.memberAddress ?? '',
		specialty: cached?.specialty ?? null,
		userType: 'TECHNICIAN',
		verificationStatus: auth.verificationStatus ?? 'PENDING',
		isVerified: auth.verificationStatus === 'APPROVED',
		averageRating: 0,
		reviewCount: 0,
		completedJobsCount: 0,
		followersCount: 0,
		services: cached?.services ?? [],
		portfolioImages: [],
	};
}
