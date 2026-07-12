/** Client-side post-signup profile onboarding (email + OAuth after account exists). */

export type PostSignupOnboardingStatus = 'pending' | 'completed' | 'skipped';

const storageKey = (userId: string) => `fixora_post_onboarding_${userId}`;

export function getPostSignupOnboardingStatus(userId: string): PostSignupOnboardingStatus | null {
	if (typeof window === 'undefined' || !userId) return null;
	const raw = localStorage.getItem(storageKey(userId));
	if (raw === 'pending' || raw === 'completed' || raw === 'skipped') return raw;
	return null;
}

export function needsPostSignupOnboarding(userId: string): boolean {
	return getPostSignupOnboardingStatus(userId) === 'pending';
}

export function markPostSignupOnboardingPending(userId: string): void {
	if (typeof window === 'undefined' || !userId) return;
	localStorage.setItem(storageKey(userId), 'pending');
}

export function markPostSignupOnboardingCompleted(userId: string): void {
	if (typeof window === 'undefined' || !userId) return;
	localStorage.setItem(storageKey(userId), 'completed');
}

export function markPostSignupOnboardingSkipped(userId: string): void {
	if (typeof window === 'undefined' || !userId) return;
	localStorage.setItem(storageKey(userId), 'skipped');
}

export function isPostSignupOnboardingIncomplete(userId: string): boolean {
	const status = getPostSignupOnboardingStatus(userId);
	return status === 'pending' || status === 'skipped';
}
