import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import {
	bindMapIdleListener,
	computeMapBounds,
	fitMapToPoints,
	getCurrentPosition,
	loadKakaoMapsSdk,
	logKakaoMapError,
	pointToOverlayPercent,
	relayoutKakaoMap,
	reverseGeocode,
	SEOUL_CENTER,
	waitForNonZeroSize,
	type KakaoMap,
	type KakaoMarker,
	type LocationChangePayload,
	type MapPoint,
} from '../../kakao-maps';

export interface LocationTechnicianPin {
	_id: string;
	shopLatitude?: number;
	shopLongitude?: number;
}

interface LocationCardProps {
	locationLabel: string;
	technicians: LocationTechnicianPin[];
	onLocationChange: (payload: LocationChangePayload) => void;
}

const TILES_LOAD_TIMEOUT_MS = 6000;

const LocationCard = ({ locationLabel, technicians, onLocationChange }: LocationCardProps) => {
	const { t } = useTranslation('common');
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<KakaoMap | null>(null);
	const userMarkerRef = useRef<KakaoMarker | null>(null);
	const kakaoRef = useRef<NonNullable<Window['kakao']> | null>(null);
	const onLocationChangeRef = useRef(onLocationChange);
	const techniciansRef = useRef(technicians);
	const initGenerationRef = useRef(0);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const tilesTimerRef = useRef<number | null>(null);
	const [locating, setLocating] = useState(false);
	const [mapError, setMapError] = useState(false);
	const [mapReady, setMapReady] = useState(false);
	const [tilesVisible, setTilesVisible] = useState(false);
	const [userPoint, setUserPoint] = useState<MapPoint>(SEOUL_CENTER);

	useEffect(() => {
		onLocationChangeRef.current = onLocationChange;
	}, [onLocationChange]);

	useEffect(() => {
		techniciansRef.current = technicians;
	}, [technicians]);

	const overlayPoints = useMemo(() => {
		const techPoints: MapPoint[] = technicians
			.filter((tech) => tech.shopLatitude != null && tech.shopLongitude != null)
			.map((tech) => ({ lat: tech.shopLatitude!, lng: tech.shopLongitude! }));

		const all = [userPoint, ...techPoints];
		return { bounds: computeMapBounds(all), userPoint, techPoints };
	}, [technicians, userPoint]);

	const clearTilesTimer = useCallback(() => {
		if (tilesTimerRef.current != null) {
			window.clearTimeout(tilesTimerRef.current);
			tilesTimerRef.current = null;
		}
	}, []);

	const markTilesVisible = useCallback(() => {
		clearTilesTimer();
		setTilesVisible(true);
		if (mapRef.current) relayoutKakaoMap(mapRef.current);
	}, [clearTilesTimer]);

	const startTilesTimer = useCallback(() => {
		clearTilesTimer();
		tilesTimerRef.current = window.setTimeout(() => {
			// Keep grid + pins if Kakao tiles never become visible (domain/API issue).
			setTilesVisible(false);
		}, TILES_LOAD_TIMEOUT_MS);
	}, [clearTilesTimer]);

	const syncMapView = useCallback(
		(techs: LocationTechnicianPin[], center: MapPoint) => {
			const kakao = kakaoRef.current;
			const map = mapRef.current;
			if (!kakao || !map) return;

			const plotted: MapPoint[] = techs
				.filter((tech) => tech.shopLatitude != null && tech.shopLongitude != null)
				.map((tech) => ({ lat: tech.shopLatitude!, lng: tech.shopLongitude! }));

			const fitPoints = [center, ...plotted];
			if (fitPoints.length) {
				fitMapToPoints(kakao, map, fitPoints, { minLevel: 5, maxLevel: 10, singlePointLevel: 8 });
				relayoutKakaoMap(map);
			}
		},
		[],
	);

	const applyLocation = useCallback(
		async (lat: number, lng: number, fallbackLabel?: string) => {
			const kakao = kakaoRef.current;
			const center = { lat, lng };
			setUserPoint(center);

			if (kakao && mapRef.current) {
				const latlng = new kakao.maps.LatLng(lat, lng);
				userMarkerRef.current?.setPosition(latlng);
				syncMapView(techniciansRef.current, center);
			}

			const defaultLabel = t('search.location.placeholder') ?? '';
			let label = fallbackLabel ?? defaultLabel;

			if (kakao) {
				try {
					const address = await reverseGeocode(kakao, lat, lng);
					if (address) label = address;
				} catch (err) {
					logKakaoMapError('reverseGeocode', err);
				}
			}

			onLocationChangeRef.current({ label, lat, lng });
		},
		[syncMapView, t],
	);

	const detectLocation = useCallback(async () => {
		setLocating(true);
		try {
			const position = await getCurrentPosition();
			await applyLocation(position.coords.latitude, position.coords.longitude);
		} catch (err) {
			logKakaoMapError('geolocation', err);
			await applyLocation(SEOUL_CENTER.lat, SEOUL_CENTER.lng, t('search.location.placeholder'));
		} finally {
			setLocating(false);
		}
	}, [applyLocation, t]);

	useEffect(() => {
		const generation = ++initGenerationRef.current;

		const initMap = async () => {
			const container = mapContainerRef.current;
			if (!container) return;

			try {
				await waitForNonZeroSize(container);
				const kakao = await loadKakaoMapsSdk();
				if (generation !== initGenerationRef.current || !mapContainerRef.current) return;

				kakaoRef.current = kakao;
				const center = new kakao.maps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng);
				const map = new kakao.maps.Map(mapContainerRef.current, {
					center,
					level: 8,
					draggable: false,
					scrollwheel: false,
					disableDoubleClick: true,
					disableDoubleClickZoom: true,
				});
				const userMarker = new kakao.maps.Marker({ map, position: center, opacity: 0 });

				mapRef.current = map;
				userMarkerRef.current = userMarker;

				bindMapIdleListener(kakao, map, markTilesVisible);
				startTilesTimer();

				resizeObserverRef.current?.disconnect();
				resizeObserverRef.current = new ResizeObserver(() => {
					if (mapRef.current) relayoutKakaoMap(mapRef.current);
				});
				resizeObserverRef.current.observe(mapContainerRef.current);

				setMapError(false);
				setMapReady(true);
				window.setTimeout(() => {
					if (generation === initGenerationRef.current && mapRef.current) {
						relayoutKakaoMap(mapRef.current);
						syncMapView(techniciansRef.current, SEOUL_CENTER);
					}
				}, 150);
			} catch (err) {
				logKakaoMapError('initMap', err);
				if (generation !== initGenerationRef.current) return;
				setMapError(true);
				setMapReady(true);
				setTilesVisible(false);
				onLocationChangeRef.current({
					label: t('search.location.placeholder') ?? '',
					lat: SEOUL_CENTER.lat,
					lng: SEOUL_CENTER.lng,
				});
			}
		};

		initMap();

		return () => {
			initGenerationRef.current += 1;
			clearTilesTimer();
			resizeObserverRef.current?.disconnect();
			resizeObserverRef.current = null;
			mapRef.current = null;
			userMarkerRef.current = null;
			kakaoRef.current = null;
		};
	}, [clearTilesTimer, markTilesVisible, startTilesTimer, syncMapView, t]);

	useEffect(() => {
		if (mapReady) {
			detectLocation();
		}
	}, [mapReady, detectLocation]);

	useEffect(() => {
		if (mapReady) {
			syncMapView(technicians, userPoint);
		}
	}, [mapReady, technicians, userPoint, syncMapView]);

	const showGridBackground = mapError || !tilesVisible;

	return (
		<div className="fixora-search-location">
			<div
				className={`fixora-search-location__map${showGridBackground ? ' fixora-search-location__map--fallback' : ''}`}
			>
				<div ref={mapContainerRef} className="fixora-search-location__map-canvas" />
				<div className="fixora-search-location__map-fallback" aria-hidden="true">
					<span
						className="fixora-search-location__dot fixora-search-location__dot--user"
						style={pointToOverlayPercent(overlayPoints.userPoint, overlayPoints.bounds)}
					/>
					{overlayPoints.techPoints.map((point, index) => (
						<span
							key={`tech-pin-${index}`}
							className="fixora-search-location__dot"
							style={pointToOverlayPercent(point, overlayPoints.bounds)}
						/>
					))}
				</div>
				{locating && (
					<div className="fixora-search-location__map-loading">{t('search.location.detecting')}</div>
				)}
			</div>
			<div className="fixora-search-location__row">
				<div className="fixora-search-location__label">
					<strong>{t('search.location.title')}</strong>
					<span>{locationLabel}</span>
				</div>
				<button
					type="button"
					className="fixora-search-location__recenter"
					aria-label={t('search.location.recenter')}
					onClick={detectLocation}
					disabled={locating}
				>
					<GpsFixedIcon fontSize="small" />
				</button>
			</div>
		</div>
	);
};

export default LocationCard;
