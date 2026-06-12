const KAKAO_MAPS_SCRIPT_ID = 'kakao-maps-sdk-script';

interface KakaoLatLng {
	getLat: () => number;
	getLng: () => number;
}

export interface KakaoMap {
	setCenter: (latlng: KakaoLatLng) => void;
}

export interface KakaoMarker {
	setMap: (map: KakaoMap | null) => void;
	setPosition: (latlng: KakaoLatLng) => void;
}

interface KakaoGeocodeResult {
	address?: {
		region_1depth_name?: string;
		region_2depth_name?: string;
	};
	road_address?: {
		region_1depth_name?: string;
		region_2depth_name?: string;
	};
}

declare global {
	interface Window {
		kakao?: {
			maps: {
				load: (callback: () => void) => void;
				LatLng: new (lat: number, lng: number) => KakaoLatLng;
				Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap;
				Marker: new (options: { map: KakaoMap; position: KakaoLatLng }) => KakaoMarker;
				event: {
					addListener: (target: KakaoMap, type: string, handler: () => void) => void;
				};
				services: {
					Status: { OK: string };
					Geocoder: new () => {
						coord2Address: (
							lng: number,
							lat: number,
							callback: (result: KakaoGeocodeResult[], status: string) => void,
						) => void;
					};
				};
			};
		};
	}
}

export const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };

export function loadKakaoMapsSdk(): Promise<NonNullable<Window['kakao']>> {
	const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

	if (typeof window === 'undefined') {
		return Promise.reject(new Error('Kakao Maps requires browser'));
	}

	if (!jsKey) {
		return Promise.reject(new Error('NEXT_PUBLIC_KAKAO_JS_KEY is not configured'));
	}

	if (window.kakao?.maps) {
		return new Promise((resolve) => {
			window.kakao!.maps.load(() => resolve(window.kakao!));
		});
	}

	return new Promise((resolve, reject) => {
		const existing = document.getElementById(KAKAO_MAPS_SCRIPT_ID) as HTMLScriptElement | null;

		const onReady = () => {
			if (!window.kakao?.maps) {
				reject(new Error('Kakao Maps SDK not loaded'));
				return;
			}
			window.kakao.maps.load(() => resolve(window.kakao!));
		};

		if (existing) {
			existing.addEventListener('load', onReady);
			existing.addEventListener('error', () => reject(new Error('Kakao Maps script failed')));
			return;
		}

		const script = document.createElement('script');
		script.id = KAKAO_MAPS_SCRIPT_ID;
		script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}&autoload=false&libraries=services`;
		script.async = true;
		script.onload = onReady;
		script.onerror = () => reject(new Error('Kakao Maps script failed'));
		document.head.appendChild(script);
	});
}

export function formatKakaoAddress(result: KakaoGeocodeResult[]): string {
	const addr = result[0]?.road_address ?? result[0]?.address;
	if (!addr) return '';

	const city = addr.region_1depth_name ?? '';
	const district = addr.region_2depth_name ?? '';
	return [city, district].filter(Boolean).join(', ');
}

export function reverseGeocode(kakao: NonNullable<Window['kakao']>, lat: number, lng: number): Promise<string> {
	return new Promise((resolve, reject) => {
		const geocoder = new kakao.maps.services.Geocoder();
		geocoder.coord2Address(lng, lat, (result, status) => {
			if (status !== kakao.maps.services.Status.OK || !result?.length) {
				reject(new Error('Geocode failed'));
				return;
			}
			resolve(formatKakaoAddress(result));
		});
	});
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) {
			reject(new Error('Geolocation unavailable'));
			return;
		}
		navigator.geolocation.getCurrentPosition(resolve, reject, {
			enableHighAccuracy: true,
			timeout: 10000,
			maximumAge: 60000,
		});
	});
}
