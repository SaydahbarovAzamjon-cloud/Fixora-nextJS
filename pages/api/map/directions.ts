import type { NextApiRequest, NextApiResponse } from 'next';
import type { MapPoint } from '../../../libs/kakao-maps';

interface RouteApiSuccess {
	distanceKm: number;
	drivingMinutes: number;
	walkingMinutes: number | null;
	taxiMinutes: number | null;
	taxiFareKrw: number | null;
	path: MapPoint[];
}

interface MobilityRoad {
	vertexes?: number[];
}

interface MobilitySection {
	roads?: MobilityRoad[];
}

interface MobilityRoute {
	summary?: {
		distance?: number;
		duration?: number;
		fare?: { taxi?: number; toll?: number };
	};
	sections?: MobilitySection[];
}

function getKakaoRestKey(): string | undefined {
	return process.env.KAKAO_REST_API_KEY || process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
}

function decodeVertexes(vertexes: number[]): MapPoint[] {
	const path: MapPoint[] = [];
	for (let i = 0; i < vertexes.length - 1; i += 2) {
		path.push({ lng: vertexes[i], lat: vertexes[i + 1] });
	}
	return path;
}

function extractPath(route: MobilityRoute): MapPoint[] {
	const path: MapPoint[] = [];
	route.sections?.forEach((section) => {
		section.roads?.forEach((road) => {
			if (road.vertexes?.length) {
				path.push(...decodeVertexes(road.vertexes));
			}
		});
	});
	return path;
}

async function fetchKakaoJson(url: string, restKey: string): Promise<unknown | null> {
	const response = await fetch(url, {
		headers: {
			Authorization: `KakaoAK ${restKey}`,
			Accept: 'application/json',
		},
	});
	if (!response.ok) return null;
	return response.json();
}

async function fetchDrivingRoute(
	origin: string,
	destination: string,
	restKey: string,
): Promise<{ path: MapPoint[]; distanceM: number; durationSec: number; taxiFareKrw: number | null } | null> {
	const url =
		`https://apis-navi.kakaomobility.com/v1/directions` +
		`?origin=${encodeURIComponent(origin)}` +
		`&destination=${encodeURIComponent(destination)}` +
		`&priority=RECOMMEND&summary=false&car_fuel=GASOLINE&car_type=1`;

	const data = (await fetchKakaoJson(url, restKey)) as { routes?: MobilityRoute[] } | null;
	const route = data?.routes?.[0];
	if (!route?.summary) return null;

	const path = extractPath(route);
	if (path.length < 2) return null;

	return {
		path,
		distanceM: route.summary.distance ?? 0,
		durationSec: route.summary.duration ?? 0,
		taxiFareKrw: route.summary.fare?.taxi ?? null,
	};
}

async function fetchWalkingDurationSec(
	origin: string,
	destination: string,
	restKey: string,
): Promise<number | null> {
	const endpoints = [
		`https://apis-navi.kakaomobility.com/affiliate/walking/v1/directions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&summary=true&priority=DISTANCE`,
		`https://apis-navi.kakaomobility.com/v1/walk/directions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&summary=true`,
	];

	for (const url of endpoints) {
		const data = (await fetchKakaoJson(url, restKey)) as {
			routes?: Array<{ summary?: { duration?: number } }>;
		} | null;
		const duration = data?.routes?.[0]?.summary?.duration;
		if (duration && duration > 0) return duration;
	}

	return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		res.setHeader('Allow', 'GET');
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const fromLat = Number(req.query.fromLat);
	const fromLng = Number(req.query.fromLng);
	const toLat = Number(req.query.toLat);
	const toLng = Number(req.query.toLng);

	if (![fromLat, fromLng, toLat, toLng].every(Number.isFinite)) {
		return res.status(400).json({ error: 'Invalid coordinates' });
	}

	const restKey = getKakaoRestKey();
	if (!restKey) {
		return res.status(503).json({
			error: 'KAKAO_REST_API_KEY is not configured — add REST API key in .env.local for road routing',
		});
	}

	const origin = `${fromLng},${fromLat}`;
	const destination = `${toLng},${toLat}`;

	try {
		const driving = await fetchDrivingRoute(origin, destination, restKey);
		if (!driving) {
			return res.status(502).json({ error: 'Unable to calculate driving route on roads' });
		}

		const walkingDurationSec = await fetchWalkingDurationSec(origin, destination, restKey);
		const drivingMinutes = Math.max(1, Math.round(driving.durationSec / 60));
		const walkingMinutes = walkingDurationSec
			? Math.max(1, Math.round(walkingDurationSec / 60))
			: null;
		// Taxi ETA is typically close to driving time in urban Korea.
		const taxiMinutes = Math.max(1, Math.round((driving.durationSec * 1.08) / 60));

		const payload: RouteApiSuccess = {
			distanceKm: driving.distanceM / 1000,
			drivingMinutes,
			walkingMinutes,
			taxiMinutes,
			taxiFareKrw: driving.taxiFareKrw,
			path: driving.path,
		};

		return res.status(200).json(payload);
	} catch {
		return res.status(502).json({ error: 'Route service unavailable' });
	}
}
