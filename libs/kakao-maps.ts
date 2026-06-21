const KAKAO_MAPS_SCRIPT_ID = 'kakao-maps-sdk-script';

export const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };
export const DEFAULT_GEO_SEARCH_RADIUS_KM = 10;

/** Kakao Maps tile coverage is Korea-only — coords outside this box show a blank map. */
const KOREA_BOUNDS = {
	minLat: 33.0,
	maxLat: 38.9,
	minLng: 124.5,
	maxLng: 132.1,
};

export function isWithinKorea(lat: number, lng: number): boolean {
	return (
		lat >= KOREA_BOUNDS.minLat &&
		lat <= KOREA_BOUNDS.maxLat &&
		lng >= KOREA_BOUNDS.minLng &&
		lng <= KOREA_BOUNDS.maxLng
	);
}

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
	setImage: (image: KakaoMarkerImage) => void;
	setZIndex: (zIndex: number) => void;
}

export interface KakaoCustomOverlay {
	setMap: (map: KakaoMap | null) => void;
	setPosition: (latlng: KakaoLatLng) => void;
	setContent: (content: string | HTMLElement) => void;
}

export interface KakaoMarkerClusterer {
	clear: () => void;
	addMarkers: (markers: KakaoMarker[]) => void;
	setMap: (map: KakaoMap | null) => void;
}

interface KakaoClusterStyle {
	width: string;
	height: string;
	background: string;
	borderRadius: string;
	color: string;
	textAlign: string;
	fontWeight: string;
	lineHeight: string;
	border?: string;
	boxShadow?: string;
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
						mapTypeId?: number;
					},
				) => KakaoMap;
				Marker: new (options: {
					map?: KakaoMap | null;
					position: KakaoLatLng;
					image?: KakaoMarkerImage;
					opacity?: number;
					zIndex?: number;
				}) => KakaoMarker;
				CustomOverlay: new (options: {
					map?: KakaoMap | null;
					position: KakaoLatLng;
					content: string | HTMLElement;
					yAnchor?: number;
					xAnchor?: number;
					zIndex?: number;
				}) => KakaoCustomOverlay;
				MarkerClusterer: new (options: {
					map: KakaoMap;
					markers?: KakaoMarker[];
					averageCenter?: boolean;
					minLevel?: number;
					disableClickZoom?: boolean;
					gridSize?: number;
					minClusterSize?: number;
					styles?: KakaoClusterStyle[];
				}) => KakaoMarkerClusterer;
				MarkerImage: new (
					src: string,
					size: KakaoSize,
					options?: { offset?: KakaoPoint },
				) => KakaoMarkerImage;
				MapTypeId: {
					ROADMAP: number;
				};
				event: {
					addListener: (
						target: KakaoMap | KakaoMarker | KakaoMarkerClusterer,
						type: string,
						handler: (evt?: unknown) => void,
					) => void;
					removeListener: (
						target: KakaoMap | KakaoMarker | KakaoMarkerClusterer,
						type: string,
						handler: (evt?: unknown) => void,
					) => void;
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

function pinMarkerSvg(fill: string, stroke: string, inner: string, scale = 1): string {
	const w = Math.round(32 * scale);
	const h = Math.round(40 * scale);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 32 40">
		<path d="M16 0C9.37 0 4 5.37 4 12c0 9 12 28 12 28s12-19 12-28C28 5.37 22.63 0 16 0z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
		<circle cx="16" cy="12" r="5" fill="${inner}"/>
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

/** Kakao tiles often need repeated relayout after the container gains layout (sidebar mount). */
export function scheduleMapRelayout(map: KakaoMap): void {
	relayoutKakaoMap(map);
	if (typeof window === 'undefined') return;

	window.requestAnimationFrame(() => {
		relayoutKakaoMap(map);
		window.requestAnimationFrame(() => relayoutKakaoMap(map));
	});

	[100, 300, 600].forEach((delay) => {
		window.setTimeout(() => relayoutKakaoMap(map), delay);
	});
}

export function waitForNonZeroSize(element: HTMLElement, timeoutMs = 8000): Promise<void> {
	const hasSize = (el: HTMLElement) => el.offsetWidth > 0 && el.offsetHeight > 0;

	if (hasSize(element)) {
		return Promise.resolve();
	}

	const parent = element.parentElement;
	if (parent && hasSize(parent)) {
		return Promise.resolve();
	}

	return new Promise((resolve, reject) => {
		const targets = [element, parent].filter(Boolean) as HTMLElement[];

		const tryResolve = () => {
			if (hasSize(element) || (parent && hasSize(parent))) {
				observer.disconnect();
				resolve();
				return true;
			}
			return false;
		};

		const observer = new ResizeObserver(() => {
			tryResolve();
		});

		targets.forEach((el) => observer.observe(el));

		window.setTimeout(() => {
			observer.disconnect();
			if (tryResolve()) return;
			if (hasSize(element) || (parent && hasSize(parent))) resolve();
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

export function destroyKakaoMap(marker: KakaoMarker | null, container: HTMLElement | null): void {
	try {
		marker?.setMap(null);
	} catch (err) {
		logKakaoMapError('destroyMarker', err);
	}

	if (container) {
		// Kakao Map has no public destroy(); clear the node so the next init gets a clean container.
		container.replaceChildren();
	}
}

export function bindMapIdleListener(
	kakao: NonNullable<Window['kakao']>,
	map: KakaoMap,
	onTilesLoaded: () => void,
): void {
	try {
		kakao.maps.event.addListener(map, 'tilesloaded', onTilesLoaded);
		// Relayout when map settles; do not treat idle as "tiles visible"
		kakao.maps.event.addListener(map, 'idle', () => scheduleMapRelayout(map));
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
	const src = markerDataUri(pinMarkerSvg('#730C1E', 'rgba(255,255,255,0.35)', '#ffffff'));
	const size = new kakao.maps.Size(32, 40);
	const offset = new kakao.maps.Point(16, 40);
	return new kakao.maps.MarkerImage(src, size, { offset });
}

export function createTechnicianMarkerImageSelected(kakao: NonNullable<Window['kakao']>): KakaoMarkerImage {
	const src = markerDataUri(pinMarkerSvg('#ffffff', '#730C1E', '#730C1E', 1.15));
	const size = new kakao.maps.Size(36, 46);
	const offset = new kakao.maps.Point(18, 46);
	return new kakao.maps.MarkerImage(src, size, { offset });
}

export function createTechnicianClusterStyles(): KakaoClusterStyle[] {
	return [
		{
			width: '44px',
			height: '44px',
			background: 'rgba(115, 12, 30, 0.92)',
			borderRadius: '22px',
			color: '#ffffff',
			textAlign: 'center',
			fontWeight: '700',
			lineHeight: '44px',
			border: '2px solid rgba(255, 255, 255, 0.35)',
			boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
		},
		{
			width: '52px',
			height: '52px',
			background: 'rgba(115, 12, 30, 0.95)',
			borderRadius: '26px',
			color: '#ffffff',
			textAlign: 'center',
			fontWeight: '700',
			lineHeight: '52px',
			border: '2px solid rgba(255, 255, 255, 0.4)',
			boxShadow: '0 6px 18px rgba(0, 0, 0, 0.4)',
		},
	];
}

export function createTechnicianMarkerClusterer(
	kakao: NonNullable<Window['kakao']>,
	map: KakaoMap,
	markers: KakaoMarker[],
): KakaoMarkerClusterer {
	return new kakao.maps.MarkerClusterer({
		map,
		markers,
		averageCenter: true,
		minLevel: 4,
		disableClickZoom: false,
		gridSize: 64,
		minClusterSize: 2,
		styles: createTechnicianClusterStyles(),
	});
}

export function createMapTooltipOverlay(
	kakao: NonNullable<Window['kakao']>,
	position: KakaoLatLng,
	html: string,
): KakaoCustomOverlay {
	return new kakao.maps.CustomOverlay({
		position,
		content: html,
		yAnchor: 2.2,
		xAnchor: 0.5,
		zIndex: 4,
	});
}

export function fitMapToTechnicians(
	kakao: NonNullable<Window['kakao']>,
	map: KakaoMap,
	technicianPoints: MapPoint[],
	options?: { includeUser?: MapPoint; minLevel?: number; maxLevel?: number; singlePointLevel?: number },
): void {
	const { includeUser, minLevel = 4, maxLevel = 11, singlePointLevel = 7 } = options ?? {};
	const points = includeUser ? [includeUser, ...technicianPoints] : technicianPoints;

	if (!points.length) return;

	if (technicianPoints.length === 1 && !includeUser) {
		const point = technicianPoints[0];
		map.setCenter(new kakao.maps.LatLng(point.lat, point.lng));
		map.setLevel(singlePointLevel);
		return;
	}

	fitMapToPoints(kakao, map, points, { minLevel, maxLevel, singlePointLevel });
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

	const needsClustererReload = (): boolean => {
		const existing =
			(document.getElementById(KAKAO_MAPS_SCRIPT_ID) as HTMLScriptElement | null) ??
			(document.querySelector('script[src*="dapi.kakao.com/v2/maps/sdk.js"]') as HTMLScriptElement | null);
		return !!existing && !existing.src.includes('clusterer');
	};

	if (needsClustererReload()) {
		document.getElementById(KAKAO_MAPS_SCRIPT_ID)?.remove();
		document.querySelectorAll('script[src*="dapi.kakao.com/v2/maps/sdk.js"]').forEach((node) => node.remove());
		delete window.kakao;
	}

	return new Promise((resolve, reject) => {
		const boot = () => {
			waitForMapsApi().then(resolve).catch(reject);
		};

		const existing =
			(document.getElementById(KAKAO_MAPS_SCRIPT_ID) as HTMLScriptElement | null) ??
			(document.querySelector('script[src*="dapi.kakao.com/v2/maps/sdk.js"]') as HTMLScriptElement | null);
		if (existing) {
			boot();
			return;
		}

		const script = document.createElement('script');
		script.id = KAKAO_MAPS_SCRIPT_ID;
		script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}&autoload=false&libraries=services,clusterer`;
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

export function formatCoordLabel(lat: number, lng: number): string {
	return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export function reverseGeocode(kakao: NonNullable<Window['kakao']>, lat: number, lng: number): Promise<string> {
	const geocodePromise = new Promise<string>((resolve) => {
		try {
			const geocoder = new kakao.maps.services.Geocoder();
			geocoder.coord2Address(lng, lat, (result, status) => {
				if (status !== kakao.maps.services.Status.OK || !result?.length) {
					// Expected when coords are outside Korea or Geocoder has no match — not a hard error.
					resolve('');
					return;
				}
				resolve(formatKakaoAddress(result));
			});
		} catch (err) {
			logKakaoMapError('reverseGeocode', err);
			resolve('');
		}
	});

	return withTimeout(geocodePromise, 6000, 'Reverse geocode').catch(() => '');
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
