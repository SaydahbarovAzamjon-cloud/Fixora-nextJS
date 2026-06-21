import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { GET_TECHNICIANS } from '../../../apollo/user/query';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import {
	bindMapIdleListener,
	computeMapBounds,
	createMapTooltipOverlay,
	createTechnicianMarkerClusterer,
	createTechnicianMarkerImage,
	createTechnicianMarkerImageSelected,
	createUserMarkerImage,
	destroyKakaoMap,
	fitMapToTechnicians,
	formatCoordLabel,
	getCurrentPosition,
	isWithinKorea,
	loadKakaoMapsSdk,
	logKakaoMapError,
	pointToOverlayPercent,
	scheduleMapRelayout,
	reverseGeocode,
	SEOUL_CENTER,
	waitForNonZeroSize,
	type KakaoCustomOverlay,
	type KakaoMap,
	type KakaoMarker,
	type KakaoMarkerClusterer,
	type LocationChangePayload,
	type MapPoint,
} from '../../kakao-maps';
import { TechniciansInquiry, TechnicianSummary } from '../../types/fixora/fixora';
import {
	distanceKmBetween,
	getPlottableTechnicians,
	technicianDisplayName,
	type PlottableTechnician,
} from '../../utils/technicianMap';
import TechnicianMapBottomSheet from './map/TechnicianMapBottomSheet';
import TechnicianMapPreviewCard from './map/TechnicianMapPreviewCard';
import { buildMapTooltipHtml } from './map/buildMapTooltipHtml';

interface LocationCardProps {
	locationLabel: string;
	searchFilter: TechniciansInquiry;
	onLocationChange: (payload: LocationChangePayload) => void;
}

interface MarkerListener {
	target: KakaoMarker;
	type: string;
	handler: (evt?: unknown) => void;
}

const TILES_LOAD_TIMEOUT_MS = 10000;
const MAP_TECHNICIAN_LIMIT = 100;

const LocationCard = ({ locationLabel, searchFilter, onLocationChange }: LocationCardProps) => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';

	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<KakaoMap | null>(null);
	const userMarkerRef = useRef<KakaoMarker | null>(null);
	const kakaoRef = useRef<NonNullable<Window['kakao']> | null>(null);
	const clustererRef = useRef<KakaoMarkerClusterer | null>(null);
	const markerRefs = useRef<Record<string, KakaoMarker>>({});
	const markerListenersRef = useRef<MarkerListener[]>([]);
	const defaultMarkerImageRef = useRef<ReturnType<typeof createTechnicianMarkerImage> | null>(null);
	const selectedMarkerImageRef = useRef<ReturnType<typeof createTechnicianMarkerImageSelected> | null>(null);
	const tooltipOverlayRef = useRef<KakaoCustomOverlay | null>(null);
	const onLocationChangeRef = useRef(onLocationChange);
	const selectedIdRef = useRef<string | null>(null);
	const isMobileRef = useRef(isMobile);
	const initGenerationRef = useRef(0);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const tilesTimerRef = useRef<number | null>(null);

	const [locating, setLocating] = useState(false);
	const [mapError, setMapError] = useState(false);
	const [tilesReady, setTilesReady] = useState(false);
	const [tilesVisible, setTilesVisible] = useState(false);
	const [userPoint, setUserPoint] = useState<MapPoint>(SEOUL_CENTER);
	const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);

	const mapQueryInput = useMemo(
		(): TechniciansInquiry => ({
			...searchFilter,
			page: 1,
			limit: MAP_TECHNICIAN_LIMIT,
		}),
		[searchFilter],
	);

	const { data: mapData } = useQuery(GET_TECHNICIANS, {
		variables: { input: mapQueryInput },
		fetchPolicy: 'cache-and-network',
	});

	const mapTechnicians: TechnicianSummary[] = mapData?.getTechnicians?.list ?? [];
	const plottableTechnicians = useMemo(() => getPlottableTechnicians(mapTechnicians), [mapTechnicians]);

	const selectedTechnician = useMemo(
		() => plottableTechnicians.find((tech) => tech._id === selectedTechnicianId) ?? null,
		[plottableTechnicians, selectedTechnicianId],
	);

	const selectedDistanceKm = useMemo(() => {
		if (!selectedTechnician) return null;
		return distanceKmBetween(userPoint, {
			lat: selectedTechnician.shopLatitude,
			lng: selectedTechnician.shopLongitude,
		});
	}, [selectedTechnician, userPoint]);

	useEffect(() => {
		onLocationChangeRef.current = onLocationChange;
	}, [onLocationChange]);

	useEffect(() => {
		selectedIdRef.current = selectedTechnicianId;
	}, [selectedTechnicianId]);

	useEffect(() => {
		isMobileRef.current = isMobile;
	}, [isMobile]);

	const overlayPoints = useMemo(() => {
		const techPoints: MapPoint[] = plottableTechnicians.map((tech) => ({
			lat: tech.shopLatitude,
			lng: tech.shopLongitude,
		}));
		const all = [userPoint, ...techPoints];
		return { bounds: computeMapBounds(all), userPoint, techPoints };
	}, [plottableTechnicians, userPoint]);

	const clearTilesTimer = useCallback(() => {
		if (tilesTimerRef.current != null) {
			window.clearTimeout(tilesTimerRef.current);
			tilesTimerRef.current = null;
		}
	}, []);

	const markTilesVisible = useCallback(() => {
		clearTilesTimer();
		setTilesVisible(true);
		setTilesReady(true);
		if (mapRef.current) scheduleMapRelayout(mapRef.current);
	}, [clearTilesTimer]);

	const startTilesTimer = useCallback(() => {
		clearTilesTimer();
		tilesTimerRef.current = window.setTimeout(() => {
			setTilesVisible(false);
			setTilesReady(true);
		}, TILES_LOAD_TIMEOUT_MS);
	}, [clearTilesTimer]);

	const hideTooltip = useCallback(() => {
		tooltipOverlayRef.current?.setMap(null);
	}, []);

	const showTooltip = useCallback(
		(tech: PlottableTechnician, position: InstanceType<NonNullable<Window['kakao']>['maps']['LatLng']>) => {
			const kakao = kakaoRef.current;
			const map = mapRef.current;
			if (!kakao || !map || isMobileRef.current) return;

			const rating = tech.averageRating ?? 0;
			const ratingLabel =
				rating > 0
					? t('search.map.ratingTooltip', { rating: rating.toFixed(1) })
					: t('search.map.noRating');

			const html = buildMapTooltipHtml(technicianDisplayName(tech), ratingLabel);
			if (!tooltipOverlayRef.current) {
				tooltipOverlayRef.current = createMapTooltipOverlay(kakao, position, html);
			} else {
				tooltipOverlayRef.current.setContent(html);
				tooltipOverlayRef.current.setPosition(position);
			}
			tooltipOverlayRef.current.setMap(map);
		},
		[t],
	);

	const clearMarkerLayer = useCallback(() => {
		const kakao = kakaoRef.current;
		if (kakao) {
			markerListenersRef.current.forEach(({ target, type, handler }) => {
				try {
					kakao.maps.event.removeListener(target, type, handler);
				} catch (err) {
					logKakaoMapError('removeMarkerListener', err);
				}
			});
		}
		markerListenersRef.current = [];

		try {
			clustererRef.current?.clear();
		} catch (err) {
			logKakaoMapError('clearClusterer', err);
		}
		clustererRef.current = null;

		Object.values(markerRefs.current).forEach((marker) => {
			try {
				marker.setMap(null);
			} catch (err) {
				logKakaoMapError('clearMarker', err);
			}
		});
		markerRefs.current = {};
		hideTooltip();
	}, [hideTooltip]);

	const syncMapView = useCallback(
		(techs: PlottableTechnician[], center: MapPoint) => {
			const kakao = kakaoRef.current;
			const map = mapRef.current;
			if (!kakao || !map) return;

			const techPoints: MapPoint[] = techs.map((tech) => ({
				lat: tech.shopLatitude,
				lng: tech.shopLongitude,
			}));

			if (techPoints.length) {
				fitMapToTechnicians(kakao, map, techPoints, { singlePointLevel: 7 });
			} else {
				map.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
				map.setLevel(8);
			}
			scheduleMapRelayout(map);
		},
		[],
	);

	const rebuildMarkers = useCallback(() => {
		const kakao = kakaoRef.current;
		const map = mapRef.current;
		if (!kakao || !map || !tilesReady) return;

		clearMarkerLayer();

		if (!defaultMarkerImageRef.current) {
			defaultMarkerImageRef.current = createTechnicianMarkerImage(kakao);
		}
		if (!selectedMarkerImageRef.current) {
			selectedMarkerImageRef.current = createTechnicianMarkerImageSelected(kakao);
		}

		const defaultImg = defaultMarkerImageRef.current;
		const selectedImg = selectedMarkerImageRef.current;
		const markers: KakaoMarker[] = [];

		plottableTechnicians.forEach((tech) => {
			const position = new kakao.maps.LatLng(tech.shopLatitude, tech.shopLongitude);
			const isSelected = tech._id === selectedIdRef.current;
			const marker = new kakao.maps.Marker({
				position,
				image: isSelected ? selectedImg : defaultImg,
				zIndex: isSelected ? 3 : 1,
			});

			markerRefs.current[tech._id] = marker;
			markers.push(marker);

			const clickHandler = () => {
				setSelectedTechnicianId(tech._id);
			};
			kakao.maps.event.addListener(marker, 'click', clickHandler);
			markerListenersRef.current.push({ target: marker, type: 'click', handler: clickHandler });

			if (!isMobileRef.current) {
				const mouseoverHandler = () => showTooltip(tech, position);
				const mouseoutHandler = () => hideTooltip();
				kakao.maps.event.addListener(marker, 'mouseover', mouseoverHandler);
				kakao.maps.event.addListener(marker, 'mouseout', mouseoutHandler);
				markerListenersRef.current.push(
					{ target: marker, type: 'mouseover', handler: mouseoverHandler },
					{ target: marker, type: 'mouseout', handler: mouseoutHandler },
				);
			}
		});

		if (markers.length) {
			clustererRef.current = createTechnicianMarkerClusterer(kakao, map, markers);
		}

		syncMapView(plottableTechnicians, userPoint);
	}, [clearMarkerLayer, hideTooltip, plottableTechnicians, showTooltip, syncMapView, tilesReady, userPoint]);

	const applyLocation = useCallback(
		async (lat: number, lng: number, fallbackLabel?: string) => {
			const kakao = kakaoRef.current;
			const center = { lat, lng };
			setUserPoint(center);

			if (kakao && mapRef.current) {
				const latlng = new kakao.maps.LatLng(lat, lng);
				userMarkerRef.current?.setPosition(latlng);
				syncMapView(plottableTechnicians, center);
			}

			const defaultLabel = t('search.location.placeholder') ?? '';
			let label = fallbackLabel ?? defaultLabel;

			if (kakao) {
				const address = await reverseGeocode(kakao, lat, lng);
				if (address) {
					label = address;
				} else if (!fallbackLabel) {
					label = formatCoordLabel(lat, lng);
				}
			}

			onLocationChangeRef.current({ label, lat, lng });
		},
		[plottableTechnicians, syncMapView, t],
	);

	const detectLocation = useCallback(async () => {
		setLocating(true);
		try {
			const position = await getCurrentPosition();
			const { latitude: lat, longitude: lng } = position.coords;

			if (isWithinKorea(lat, lng)) {
				await applyLocation(lat, lng);
			} else {
				await applyLocation(SEOUL_CENTER.lat, SEOUL_CENTER.lng, t('search.location.outsideKorea'));
			}
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
					mapTypeId: kakao.maps.MapTypeId.ROADMAP,
					draggable: true,
					scrollwheel: true,
					disableDoubleClick: false,
					disableDoubleClickZoom: false,
				});
				const userMarker = new kakao.maps.Marker({
					map,
					position: center,
					image: createUserMarkerImage(kakao),
					zIndex: 2,
				});

				mapRef.current = map;
				userMarkerRef.current = userMarker;

				defaultMarkerImageRef.current = createTechnicianMarkerImage(kakao);
				selectedMarkerImageRef.current = createTechnicianMarkerImageSelected(kakao);

				scheduleMapRelayout(map);
				bindMapIdleListener(kakao, map, markTilesVisible);
				startTilesTimer();

				const mapShell = mapContainerRef.current.parentElement;
				resizeObserverRef.current?.disconnect();
				resizeObserverRef.current = new ResizeObserver(() => {
					if (mapRef.current) scheduleMapRelayout(mapRef.current);
				});
				resizeObserverRef.current.observe(mapContainerRef.current);
				if (mapShell) resizeObserverRef.current.observe(mapShell);

				kakao.maps.event.addListener(map, 'click', () => {
					setSelectedTechnicianId(null);
				});

				setMapError(false);
				setTilesReady(false);
				window.setTimeout(() => {
					if (generation === initGenerationRef.current && mapRef.current) {
						scheduleMapRelayout(mapRef.current);
					}
				}, 300);
			} catch (err) {
				logKakaoMapError('initMap', err);
				if (generation !== initGenerationRef.current) return;
				setMapError(true);
				setTilesReady(true);
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
			clearMarkerLayer();
			hideTooltip();
			tooltipOverlayRef.current = null;
			destroyKakaoMap(userMarkerRef.current, mapContainerRef.current);
			mapRef.current = null;
			userMarkerRef.current = null;
			kakaoRef.current = null;
			clustererRef.current = null;
			defaultMarkerImageRef.current = null;
			selectedMarkerImageRef.current = null;
		};
	}, [clearMarkerLayer, clearTilesTimer, hideTooltip, markTilesVisible, startTilesTimer, t]);

	useEffect(() => {
		if (tilesReady) {
			detectLocation();
		}
	}, [tilesReady, detectLocation]);

	useEffect(() => {
		if (tilesReady) {
			rebuildMarkers();
		}
	}, [tilesReady, plottableTechnicians, rebuildMarkers]);

	useEffect(() => {
		const kakao = kakaoRef.current;
		const defaultImg = defaultMarkerImageRef.current;
		const selectedImg = selectedMarkerImageRef.current;
		if (!kakao || !defaultImg || !selectedImg) return;

		Object.entries(markerRefs.current).forEach(([id, marker]) => {
			const isSelected = id === selectedTechnicianId;
			marker.setImage(isSelected ? selectedImg : defaultImg);
			marker.setZIndex(isSelected ? 3 : 1);
		});
	}, [selectedTechnicianId]);

	const showGridBackground = mapError || !tilesVisible;
	const hasPreview = !!selectedTechnician;

	return (
		<div className={`fixora-search-location${hasPreview ? ' fixora-search-location--has-preview' : ''}`}>
			<div className="fixora-search-location__map-stage">
				<div
					className={`fixora-search-location__map${showGridBackground ? ' fixora-search-location__map--fallback' : ''}`}
				>
					<div ref={mapContainerRef} className="fixora-search-location__map-canvas" />
					{showGridBackground && (
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
					)}
					{showGridBackground && !locating && (
						<p className="fixora-search-location__map-hint">{t('search.location.mapFallback')}</p>
					)}
					{locating && (
						<div className="fixora-search-location__map-loading">{t('search.location.detecting')}</div>
					)}
				</div>

				{isMobile && (
					<TechnicianMapBottomSheet
						open={hasPreview}
						technician={selectedTechnician}
						distanceKm={selectedDistanceKm}
						onClose={() => setSelectedTechnicianId(null)}
					/>
				)}

				{!isMobile && hasPreview && selectedTechnician && (
					<aside className="fixora-search-location__preview-panel">
						<TechnicianMapPreviewCard
							technician={selectedTechnician}
							distanceKm={selectedDistanceKm}
							onClose={() => setSelectedTechnicianId(null)}
						/>
					</aside>
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
