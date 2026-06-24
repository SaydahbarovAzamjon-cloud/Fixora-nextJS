import { TechnicianSettingsUser } from '../hooks/useTechnicianSettings';

const CACHE_PREFIX = 'fixora_technician_settings:';
const EMAIL_PREFIX = 'fixora_user_email:';

/** Last-known settings profile synced from GraphQL (query/mutation) — not form state. */
export function readTechnicianSettingsCache(userId: string): TechnicianSettingsUser | null {
	if (typeof window === 'undefined' || !userId) return null;
	try {
		const raw = localStorage.getItem(`${CACHE_PREFIX}${userId}`);
		if (!raw) return null;
		return JSON.parse(raw) as TechnicianSettingsUser;
	} catch {
		return null;
	}
}

export function writeTechnicianSettingsCache(user: TechnicianSettingsUser): void {
	if (typeof window === 'undefined' || !user._id) return;
	localStorage.setItem(`${CACHE_PREFIX}${user._id}`, JSON.stringify(user));
}

export function mergeTechnicianSettingsCache(
	userId: string,
	partial: Partial<TechnicianSettingsUser>,
): TechnicianSettingsUser {
	const base = readTechnicianSettingsCache(userId) ?? { _id: userId };
	const merged = { ...base, ...partial, _id: userId };
	writeTechnicianSettingsCache(merged);
	return merged;
}

export function readStoredUserEmail(userId: string): string | null {
	if (typeof window === 'undefined' || !userId) return null;
	return localStorage.getItem(`${EMAIL_PREFIX}${userId}`);
}

export function writeStoredUserEmail(userId: string, email: string | null | undefined): void {
	if (typeof window === 'undefined' || !userId) return;
	if (email?.trim()) localStorage.setItem(`${EMAIL_PREFIX}${userId}`, email.trim());
	else localStorage.removeItem(`${EMAIL_PREFIX}${userId}`);
}
