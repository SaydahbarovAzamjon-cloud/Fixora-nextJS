import type { MapPoint } from '../kakao-maps';
import type { TechnicianSummary, TechniciansInquiry } from '../types/fixora/fixora';
import { prepareTechniciansQueryInput } from './technicianSearch';

export interface PlottableTechnician extends TechnicianSummary {
	shopLatitude: number;
	shopLongitude: number;
}

export function getPlottableTechnicians(technicians: TechnicianSummary[]): PlottableTechnician[] {
	return technicians.filter(
		(tech): tech is PlottableTechnician =>
			tech.shopLatitude != null &&
			tech.shopLongitude != null &&
			Number.isFinite(tech.shopLatitude) &&
			Number.isFinite(tech.shopLongitude),
	);
}

/** Haversine distance in kilometres */
export function distanceKmBetween(from: MapPoint, to: MapPoint): number {
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const dLat = toRad(to.lat - from.lat);
	const dLng = toRad(to.lng - from.lng);
	const lat1 = toRad(from.lat);
	const lat2 = toRad(to.lat);
	const a =
		Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
	return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceKm(km: number): string {
	if (km < 1) return `${Math.round(km * 1000)} m`;
	return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

export function technicianDisplayName(tech: TechnicianSummary): string {
	return tech.userNickname || tech.userFullName || tech.shopName || 'Technician';
}

/** Map pins: show all matching technicians — not only those inside the GPS radius filter. */
export function getMapTechniciansQueryInput(
	searchFilter: TechniciansInquiry,
	limit: number,
): TechniciansInquiry {
	const prepared = prepareTechniciansQueryInput(searchFilter);
	const { latitude, longitude, radiusKm, ...mapSearch } = prepared.search;
	return {
		...prepared,
		page: 1,
		limit,
		search: mapSearch,
	};
}
