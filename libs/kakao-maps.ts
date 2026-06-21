const KAKAO_MAPS_SCRIPT_ID = 'kakao-maps-sdk-script';

export const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };
export const DEFAULT_GEO_SEARCH_RADIUS_KM = 10;

interface KakaoLatLng {
	getLat: () => number;
	getLng: () => number;
}

interface KakaoSize {
	// marker sizing
}

interface KakaoPoint {
	// marker offset
}

export interface KakaoMarkerImage {
	// custom marker image
}

export interface KakaoMap {
	setCenter: (latlng: KakaoLatLng) => void;
	setBounds: (bounds: KakaoLatLngBounds) => void;
	getLevel: () => number;
	setLevel: (level: number) => void;
	relayout: () => void;
}

export interface KakaoLatLngBounds {
	extend: (latlng: KakaoLatLng) => void;
	isEmpty: () => boolean;
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

export interface LocationChangePayload {
	label: string;
	lat: number;
	lng: number;
}

export interface MapPoint {
	lat: number;
	lng: number;
}

declare global {
	interface Window {
		kakao?: {
			maps: {
				load: (callback: () => void) => void;
				LatLng: new (lat: number, lng: number) => KakaoLatLng;
				LatLngBounds: new () => KakaoLatLngBounds;
				Size: new (width: number, height: number) => KakaoSize;
				Point: new (x: number, y: number) => KakaoPoint;
				Map: new (
					container: HTMLElement,
					options: {
						center: KakaoLatLng;
						level: number;
						draggable?: boolean;
						scrollwheel?: boolean;
						disableDoubleClick?: boolean;
						disableDoubleClickZoom?: boolean;
					},
				) => KakaoMap;
				Marker: new (options: {
					map: KakaoMap;
					position: KakaoLatLng;
					image?: KakaoMarkerImage;
					opacity?: number;
				}) => KakaoMarker;
				MarkerImage: new (
					src: string,
					size: KakaoSize,
					options?: { offset?: KakaoPoint },
				) => KakaoMarkerImage;
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

function dotMarkerSvg(fill: string, glow: string): string {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
		<circle cx="9" cy="9" r="7" fill="${fill}" opacity="0.35"/>
		<circle cx="9" cy="9" r="4" fill="${fill}"/>
		<circle cx="9" cy="9" r="6" fill="none" stroke="${glow}" stroke-width="1.5" opacity="0.55"/>
	</svg>`;
}

function markerDataUri(svg: string): string {
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function logKakaoMapError(context: string, err: unknown): void {
	if (process.env.NODE_ENV === 'production') return;
	const message = err instanceof Error ? err.message : String(err);
	console.error(`[KakaoMap] ${context}:`, message);
}

export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) => {
			setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
		}),
	]);
}

export function relayoutKakaoMap(map: KakaoMap): void {
	try {
		map.relayout();
	} catch (err) {
		logKakaoMapError('relayout', err);
	}
}

export function waitForNonZeroSize(element: HTMLElement, timeoutMs = 5000): Promise<void> {
	if (element.offsetWidth > 0 && element.offsetHeight > 0) {
		return Promise.resolve();
	}

	return new Promise((resolve, reject) => {
		const observer = new ResizeObserver(() => {
			if (element.offsetWidth > 0 && element.offsetHeight > 0) {
				observer.disconnect();
				resolve();
			}
		});

		observer.observe(element);

		window.setTimeout(() => {
			observer.disconnect();
			if (element.offsetWidth > 0 && element.offsetHeight > 0) resolve();
			else reject(new Error('Map container has zero size'));
		}, timeoutMs);
	});
}

export function computeMapBounds(points: MapPoint[]): {
	minLat: number;
	maxLat: number;
	minLng: number;
	maxLng: number;
} {
	const padding = 0.01;
	const lats = points.map((p) => p.lat);
	const lngs = points.map((p) => p.lng);
	return {
		minLat: Math.min(...lats) - padding,
		maxLat: Math.max(...lats) + padding,
		minLng: Math.min(...lngs) - padding,
		maxLng: Math.max(...lngs) + padding,
	};
}

export function pointToOverlayPercent(
	point: MapPoint,
	bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
): { top: string; left: string } {
	const latSpan = bounds.maxLat - bounds.minLat || 1;
	const lngSpan = bounds.maxLng - bounds.minLng || 1;
	const top = ((bounds.maxLat - point.lat) / latSpan) * 100;
	const left = ((point.lng - bounds.minLng) / lngSpan) * 100;
	return { top: `${Math.min(92, Math.max(8, top))}%`, left: `${Math.min(92, Math.max(8, left))}%` };
}

export function bindMapIdleListener(
	kakao: NonNullable<Window['kakao']>,
	map: KakaoMap,
	onIdle: () => void,
): void {
	try {
		kakao.maps.event.addListener(map, 'idle', onIdle);
		kakao.maps.event.addListener(map, 'tilesloaded', onIdle);
	} catch (err) {
		logKakaoMapError('bindMapIdleListener', err);
	}
}

export function createUserMarkerImage(kakao: NonNullable<Window['kakao']>): KakaoMarkerImage {
	const src = markerDataUri(dotMarkerSvg('#4DA3FF', '#4DA3FF'));
	const size = new kakao.maps.Size(18, 18);
	const offset = new kakao.maps.Point(9, 9);
	return new kakao.maps.MarkerImage(src, size, { offset });
}

export function createTechnicianMarkerImage(kakao: NonNullable<Window['kakao']>): KakaoMarkerImage {
	const src = markerDataUri(dotMarkerSvg('#730C1E', '#730C1E'));
	const size = new kakao.maps.Size(18, 18);
	const offset = new kakao.maps.Point(9, 9);
	return new kakao.maps.MarkerImage(src, size, { offset });
}

export function fitMapToPoints(
	kakao: NonNullable<Window['kakao']>,
	map: KakaoMap,
	points: MapPoint[],
	options?: { minLevel?: number; maxLevel?: number; singlePointLevel?: number },
): void {
	const { minLevel = 4, maxLevel = 10, singlePointLevel = 8 } = options ?? {};

	if (!points.length) return;

	if (points.length === 1) {
		const point = points[0];
		map.setCenter(new kakao.maps.LatLng(point.lat, point.lng));
		map.setLevel(singlePointLevel);
		return;
	}

	const bounds = new kakao.maps.LatLngBounds();
	points.forEach((point) => {
		bounds.extend(new kakao.maps.LatLng(point.lat, point.lng));
	});

	if (bounds.isEmpty()) return;

	try {
		map.setBounds(bounds);
		const level = map.getLevel();
		if (level < minLevel) map.setLevel(minLevel);
		if (level > maxLevel) map.setLevel(maxLevel);
	} catch (err) {
		logKakaoMapError('fitMapToPoints', err);
		const point = points[0];
		map.setCenter(new kakao.maps.LatLng(point.lat, point.lng));
		map.setLevel(singlePointLevel);
	}
}

export function loadKakaoMapsSdk(): Promise<NonNullable<Window['kakao']>> {
	const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

	if (typeof window === 'undefined') {
		return Promise.reject(new Error('Kakao Maps requires browser'));
	}

	if (!jsKey) {
		return Promise.reject(new Error('NEXT_PUBLIC_KAKAO_JS_KEY is not configured'));
	}

	const waitForMapsApi = (): Promise<NonNullable<Window['kakao']>> =>
		new Promise((resolve, reject) => {
			const started = Date.now();
			const maxWaitMs = 15000;

			const attempt = () => {
				if (window.kakao?.maps) {
					window.kakao.maps.load(() => {
						if (window.kakao?.maps) resolve(window.kakao);
						else reject(new Error('Kakao Maps SDK not loaded'));
					});
					return;
				}

				if (Date.now() - started > maxWaitMs) {
					reject(new Error('Kakao Maps SDK load timeout'));
					return;
				}

				window.setTimeout(attempt, 50);
			};

			attempt();
		});

	if (window.kakao?.maps) {
		return waitForMapsApi();
	}

	return new Promise((resolve, reject) => {
		const boot = () => {
			waitForMapsApi().then(resolve).catch(reject);
		};

		const existing = document.getElementById(KAKAO_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
		if (existing) {
			boot();
			return;
		}

		const script = document.createElement('script');
		script.id = KAKAO_MAPS_SCRIPT_ID;
		script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}&autoload=false&libraries=services`;
		script.async = true;
		script.onload = boot;
		script.onerror = () => reject(new Error('Kakao Maps script failed — check Kakao Console Map API + domain whitelist'));
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
	const geocodePromise = new Promise<string>((resolve, reject) => {
		const geocoder = new kakao.maps.services.Geocoder();
		geocoder.coord2Address(lng, lat, (result, status) => {
			if (status !== kakao.maps.services.Status.OK || !result?.length) {
				reject(new Error('Geocode failed'));
				return;
			}
			resolve(formatKakaoAddress(result));
		});
	});

	return withTimeout(geocodePromise, 6000, 'Reverse geocode');
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
	const positionPromise = new Promise<GeolocationPosition>((resolve, reject) => {
		if (!navigator.geolocation) {
			reject(new Error('Geolocation unavailable'));
			return;
		}
		navigator.geolocation.getCurrentPosition(resolve, reject, {
			enableHighAccuracy: false,
			timeout: 8000,
			maximumAge: 120000,
		});
	});

	return withTimeout(positionPromise, 9000, 'Geolocation');
}
