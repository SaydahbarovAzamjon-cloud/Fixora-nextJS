/** Saved technicians — backed by getUserLikedTechnicians + likeTargetUser (GAP-098 resolved). */

export const SAVED_TECHNICIANS_CHANGED = 'fixora:saved-technicians-changed';

export function notifySavedTechniciansChanged(userId?: string): void {
	if (typeof window === 'undefined') return;
	window.dispatchEvent(new CustomEvent(SAVED_TECHNICIANS_CHANGED, { detail: { userId } }));
}
