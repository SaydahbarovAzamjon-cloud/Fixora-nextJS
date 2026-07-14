import { DEFAULT_GEO_SEARCH_RADIUS_KM } from '../kakao-maps';

const STORAGE_PREFIX = 'fixora_home_nearby:';
const LATEST_STORAGE_KEY = `${STORAGE_PREFIX}latest`;

export type HomepageNearbyPoint = {
	lat: number;
	lng: number;
	label?: string;
};

export function writeHomepageNearbyPoint(userId: string, point: HomepageNearbyPoint): void {
	if (typeof window === 'undefined') return;
	try {
		const serialized = JSON.stringify(point);
		localStorage.setItem(LATEST_STORAGE_KEY, serialized);
		if (userId) localStorage.setItem(`${STORAGE_PREFIX}${userId}`, serialized);
	} catch {
		/* ignore quota */
	}
}

export function readHomepageNearbyPoint(userId: string): HomepageNearbyPoint | null {
	if (typeof window === 'undefined') return null;
	try {
		const raw = userId
			? localStorage.getItem(`${STORAGE_PREFIX}${userId}`)
			: localStorage.getItem(LATEST_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as HomepageNearbyPoint;
		if (typeof parsed?.lat !== 'number' || typeof parsed?.lng !== 'number') return null;
		return parsed;
	} catch {
		return null;
	}
}

export { DEFAULT_GEO_SEARCH_RADIUS_KM };
