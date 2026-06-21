/** BACKEND_GAPS: GAP-098 — no getUserLikedTechnicians; device-local list until FixoraB ships. */

const storageKey = (userId: string) => `fixora_saved_technicians_${userId}`;

export const SAVED_TECHNICIANS_CHANGED = 'fixora:saved-technicians-changed';

function readIds(userId: string): string[] {
	if (typeof window === 'undefined' || !userId) return [];
	try {
		const raw = localStorage.getItem(storageKey(userId));
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
	} catch {
		return [];
	}
}

function writeIds(userId: string, ids: string[]): void {
	if (typeof window === 'undefined' || !userId) return;
	localStorage.setItem(storageKey(userId), JSON.stringify(ids));
	window.dispatchEvent(new CustomEvent(SAVED_TECHNICIANS_CHANGED, { detail: { userId } }));
}

export function getSavedTechnicianIds(userId: string): string[] {
	return readIds(userId);
}

export function getSavedTechnicianCount(userId: string): number {
	return readIds(userId).length;
}

/** Sync local list after likeTargetUser — source of truth is mutation response. */
export function setSavedTechnicianLiked(userId: string, technicianId: string, liked: boolean): void {
	if (!userId || !technicianId) return;
	const ids = readIds(userId);
	if (liked) {
		if (!ids.includes(technicianId)) writeIds(userId, [technicianId, ...ids]);
		return;
	}
	writeIds(
		userId,
		ids.filter((id) => id !== technicianId),
	);
}
