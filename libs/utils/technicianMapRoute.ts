import type { MapPoint } from '../kakao-maps';

export interface MapRouteInfo {
	distanceKm: number;
	drivingMinutes: number;
	walkingMinutes: number | null;
	taxiMinutes: number | null;
	taxiFareKrw: number | null;
	path: MapPoint[];
}

export class MapRouteError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'MapRouteError';
	}
}

/** Real road routing via Next.js API → Kakao Mobility (no straight-line fallback). */
export async function fetchMapRoute(from: MapPoint, to: MapPoint): Promise<MapRouteInfo> {
	const params = new URLSearchParams({
		fromLat: String(from.lat),
		fromLng: String(from.lng),
		toLat: String(to.lat),
		toLng: String(to.lng),
	});

	const response = await fetch(`/api/map/directions?${params.toString()}`);
	const data = (await response.json()) as MapRouteInfo & { error?: string };

	if (!response.ok) {
		throw new MapRouteError(data.error || 'Unable to calculate road route');
	}

	if (!data.path?.length || data.path.length < 2) {
		throw new MapRouteError('Route path is empty');
	}

	return {
		distanceKm: data.distanceKm,
		drivingMinutes: data.drivingMinutes,
		walkingMinutes: data.walkingMinutes ?? null,
		taxiMinutes: data.taxiMinutes ?? null,
		taxiFareKrw: data.taxiFareKrw ?? null,
		path: data.path,
	};
}

export function formatTravelMinutes(minutes: number | null | undefined): string {
	if (minutes == null) return '—';
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.floor(minutes / 60);
	const remainder = minutes % 60;
	return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function formatTaxiFareKrw(fare: number | null | undefined): string | null {
	if (fare == null || fare <= 0) return null;
	return `₩${fare.toLocaleString('en-US')}`;
}
