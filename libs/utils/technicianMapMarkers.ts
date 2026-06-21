import type { KakaoMap } from '../kakao-maps';
import type { PlottableTechnician } from './technicianMap';

/** Kakao map level — lower value = more zoomed in. */
export const AVATAR_MARKER_MAX_LEVEL = 6;
export const AVATAR_MARKER_MIN_PIXEL_GAP = 72;

interface PixelPoint {
	x: number;
	y: number;
}

function toPixelPoint(point: unknown): PixelPoint | null {
	if (!point || typeof point !== 'object') return null;
	const record = point as { x?: number; y?: number; getX?: () => number; getY?: () => number };
	const x = record.x ?? record.getX?.();
	const y = record.y ?? record.getY?.();
	if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
	return { x: x as number, y: y as number };
}

export function getMinMarkerPixelGap(
	kakao: NonNullable<Window['kakao']>,
	map: KakaoMap,
	technicians: PlottableTechnician[],
): number | null {
	if (technicians.length < 2) return Number.POSITIVE_INFINITY;

	const projection = (
		map as KakaoMap & {
			getProjection?: () => {
				containerPointFromCoords: (latlng: unknown) => unknown;
			};
		}
	).getProjection?.();

	if (!projection) return null;

	const pixels: PixelPoint[] = [];
	for (const tech of technicians) {
		const latlng = new kakao.maps.LatLng(tech.shopLatitude, tech.shopLongitude);
		const pixel = toPixelPoint(projection.containerPointFromCoords(latlng));
		if (!pixel) return null;
		pixels.push(pixel);
	}

	let minGap = Number.POSITIVE_INFINITY;
	for (let i = 0; i < pixels.length; i++) {
		for (let j = i + 1; j < pixels.length; j++) {
			const dx = pixels[i].x - pixels[j].x;
			const dy = pixels[i].y - pixels[j].y;
			minGap = Math.min(minGap, Math.hypot(dx, dy));
		}
	}

	return Number.isFinite(minGap) ? minGap : null;
}

export function shouldUseAvatarMapMarkers(
	mapLevel: number,
	minPixelGap: number | null,
	technicianCount: number,
): boolean {
	if (technicianCount === 0) return false;
	if (mapLevel > AVATAR_MARKER_MAX_LEVEL) return false;
	if (technicianCount === 1) return true;
	if (minPixelGap == null) return false;
	return minPixelGap >= AVATAR_MARKER_MIN_PIXEL_GAP;
}
