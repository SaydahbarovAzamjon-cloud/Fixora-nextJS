import { useEffect, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import {
	DEFAULT_GEO_SEARCH_RADIUS_KM,
	loadKakaoMapsSdk,
	searchLocations,
} from '../kakao-maps';
import { TechniciansInquiry } from '../types/fixora/fixora';
import {
	readHomepageNearbyPoint,
	writeHomepageNearbyPoint,
} from '../utils/homepageNearbyStorage';

export type NearbyTechniciansSearch = TechniciansInquiry['search'];

interface NearbyState {
	search: NearbyTechniciansSearch;
	ready: boolean;
}

const BASE_SEARCH: NearbyTechniciansSearch = {};

/**
 * Prefer client onboarding coordinates. For older users, geocode the saved
 * profile address before falling back to browser geolocation.
 */
export function useHomepageNearbySearch(): NearbyState {
	const user = useReactiveVar(userVar);
	const [state, setState] = useState<NearbyState>({ search: BASE_SEARCH, ready: false });

	useEffect(() => {
		let cancelled = false;

		const finish = (search: NearbyTechniciansSearch) => {
			if (!cancelled) setState({ search, ready: true });
		};

		const userId = user?._id ?? '';
		const profileLocation = (user?.memberAddress || '').trim();
		const savedPoint = userId ? readHomepageNearbyPoint(userId) : null;
		const latestPoint = savedPoint ?? (!userId ? readHomepageNearbyPoint('') : null);

		if (latestPoint) {
			finish({
				latitude: latestPoint.lat,
				longitude: latestPoint.lng,
				radiusKm: DEFAULT_GEO_SEARCH_RADIUS_KM,
			});
			return;
		}

		void (async () => {
			if (profileLocation) {
				try {
					const kakao = await loadKakaoMapsSdk();
					const [location] = await searchLocations(kakao, profileLocation);
					if (location) {
						writeHomepageNearbyPoint(userId, {
							lat: location.lat,
							lng: location.lng,
							label: location.label,
						});
						finish({
							latitude: location.lat,
							longitude: location.lng,
							radiusKm: DEFAULT_GEO_SEARCH_RADIUS_KM,
						});
						return;
					}
				} catch {
					/* try browser position next */
				}
			}

			if (typeof window === 'undefined' || !navigator.geolocation) {
				finish(profileLocation ? { userLocation: profileLocation } : BASE_SEARCH);
				return;
			}

			navigator.geolocation.getCurrentPosition(
				(pos) => {
					const point = {
						lat: pos.coords.latitude,
						lng: pos.coords.longitude,
					};
					writeHomepageNearbyPoint(userId, point);
					finish({
						latitude: point.lat,
						longitude: point.lng,
						radiusKm: DEFAULT_GEO_SEARCH_RADIUS_KM,
					});
				},
				() => finish(profileLocation ? { userLocation: profileLocation } : BASE_SEARCH),
				{ enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
			);
		})();

		return () => {
			cancelled = true;
		};
	}, [user?._id, user?.memberAddress]);

	return state;
}
