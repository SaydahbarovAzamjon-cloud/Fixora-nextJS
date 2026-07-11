import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { GET_TECHNICIANS } from '../../../apollo/user/query';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import {
	bindMapIdleListener,
	computeMapBounds,
	createMapMarkerPopoverOverlay,
	createMapHoverPreviewOverlay,
	attachTechnicianMarkers,
	createTechnicianMarkerImage,
	createTechnicianMarkerImageSelected,
	createUserMarkerImage,
	destroyKakaoMap,
	drawRoutePolyline,
	fitMapToRoute,
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
	type KakaoPolyline,
	type LocationChangePayload,
	type MapPoint,
} from '../../kakao-maps';
import { TechniciansInquiry, TechnicianSummary } from '../../types/fixora/fixora';
import { resolveProfileImageUrl } from '../../utils/profileImage';
import {
	distanceKmBetween,
	getMapTechniciansQueryInput,
	getPlottableTechnicians,
	type PlottableTechnician,
} from '../../utils/technicianMap';
import { fetchMapRoute, MapRouteError, type MapRouteInfo } from '../../utils/technicianMapRoute';
import {
	getMinMarkerPixelGap,
	shouldUseAvatarMapMarkers,
} from '../../utils/technicianMapMarkers';
import { buildMapHoverPreviewHtml } from './map/buildMapHoverPreviewHtml';
import { buildMarkerOverlayHtml } from './map/buildMarkerOverlayHtml';
import { createAvatarMapMarkerElement, getAvatarMarkerLabel } from './map/createAvatarMapMarker';

const DEFAULT_AVATAR = '/img/profile/defaultUser.svg';
const TILES_LOAD_TIMEOUT_MS = 10000;
const MAP_TECHNICIAN_LIMIT = 100;

interface MarkerListener {
	target: KakaoMarker;
	type: string;
	handler: (evt?: unknown) => void;
}

export interface TechnicianInteractiveMapProps {
	searchFilter: TechniciansInquiry;
	selectedTechnicianId: string | null;
	onSelectTechnician: (id: string | null) => void;
	onLocationChange?: (payload: LocationChangePayload) => void;
	onUserPointChange?: (point: MapPoint) => void;
	variant?: 'compact' | 'expanded';
	mapClassName?: string;
	showMarkerPopover?: boolean;
	routeVisible?: boolean;
	routeTechnicianId?: string | null;
	onRouteInfoChange?: (info: MapRouteInfo | null) => void;
	onRouteLoadingChange?: (loading: boolean) => void;
	onRouteErrorChange?: (message: string | null) => void;
	onExpandClick?: () => void;
	autoDetectLocation?: boolean;
	recenterRequestId?: number;
}

const TechnicianInteractiveMap = ({
	searchFilter,
	selectedTechnicianId,
	onSelectTechnician,
	onLocationChange,
	onUserPointChange,
	variant = 'compact',
	mapClassName = '',
	showMarkerPopover = false,
	routeVisible = false,
	routeTechnicianId = null,
	onRouteInfoChange,
	onRouteLoadingChange,
	onRouteErrorChange,
	onExpandClick,
	autoDetectLocation = true,
	recenterRequestId = 0,
}: TechnicianInteractiveMapProps) => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';

	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<KakaoMap | null>(null);
	const userMarkerRef = useRef<KakaoMarker | null>(null);
	const kakaoRef = useRef<NonNullable<Window['kakao']> | null>(null);
	const clustererRef = useRef<KakaoMarkerClusterer | null>(null);
	const markerRefs = useRef<Record<string, KakaoMarker>>({});
	const avatarOverlayRefs = useRef<Record<string, KakaoCustomOverlay>>({});
	const markerModeRef = useRef<'pin' | 'avatar'>('pin');
	const markerListenersRef = useRef<MarkerListener[]>([]);
	const defaultMarkerImageRef = useRef<ReturnType<typeof createTechnicianMarkerImage> | null>(null);
	const selectedMarkerImageRef = useRef<ReturnType<typeof createTechnicianMarkerImageSelected> | null>(null);
	const tooltipOverlayRef = useRef<KakaoCustomOverlay | null>(null);
	const markerPopoverRef = useRef<KakaoCustomOverlay | null>(null);
	const routePolylineRef = useRef<KakaoPolyline | null>(null);
	const selectedIdRef = useRef(selectedTechnicianId);
	const isMobileRef = useRef(isMobile);
	const initGenerationRef = useRef(0);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const tilesTimerRef = useRef<number | null>(null);
	const onLocationChangeRef = useRef(onLocationChange);
	const onUserPointChangeRef = useRef(onUserPointChange);
	const onSelectTechnicianRef = useRef(onSelectTechnician);
	const suppressMapClickRef = useRef(false);
	const refreshMarkerModeRef = useRef<() => void>(() => undefined);
	const hasFittedMapRef = useRef(false);

	const [locating, setLocating] = useState(false);
	const [mapError, setMapError] = useState(false);
	const [tilesReady, setTilesReady] = useState(false);
	const [tilesVisible, setTilesVisible] = useState(false);
	const [userPoint, setUserPoint] = useState<MapPoint>(SEOUL_CENTER);

	const mapQueryInput = useMemo(
		() => getMapTechniciansQueryInput(searchFilter, MAP_TECHNICIAN_LIMIT),
		[searchFilter],
	);

	const { data: mapData } = useQuery(GET_TECHNICIANS, {
		variables: { input: mapQueryInput },
		fetchPolicy: 'cache-and-network',
	});

	const plottableTechnicians = useMemo(
		() => getPlottableTechnicians((mapData?.getTechnicians?.list ?? []) as TechnicianSummary[]),
		[mapData],
	);

	const selectedTechnician = useMemo(
		() => plottableTechnicians.find((tech) => tech._id === selectedTechnicianId) ?? null,
		[plottableTechnicians, selectedTechnicianId],
	);

	useEffect(() => {
		onLocationChangeRef.current = onLocationChange;
	}, [onLocationChange]);

	useEffect(() => {
		onUserPointChangeRef.current = onUserPointChange;
	}, [onUserPointChange]);

	useEffect(() => {
		onSelectTechnicianRef.current = onSelectTechnician;
	}, [onSelectTechnician]);

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

	const hideHoverPreview = useCallback(() => {
		tooltipOverlayRef.current?.setMap(null);
	}, []);

	const buildHoverPreviewHtmlForTech = useCallback(
		(tech: PlottableTechnician) => {
			const personName = tech.userNickname || tech.userFullName || '';
			const shopName = tech.shopName?.trim() || '';
			const headline = personName || shopName || t('search.map.unknownTechnician');
			const rating = tech.averageRating ?? 0;
			const ratingLabel = rating > 0 ? rating.toFixed(1) : t('search.map.noRating');
			const reviewLabel = t('search.map.reviewCount', { count: tech.reviewCount ?? 0 });
			const avatarUrl = resolveProfileImageUrl(tech.userProfileImage) || DEFAULT_AVATAR;

			return buildMapHoverPreviewHtml({
				name: headline,
				shopName: shopName && personName ? shopName : undefined,
				ratingLabel,
				reviewLabel,
				avatarUrl,
			});
		},
		[t],
	);

	const showHoverPreview = useCallback(
		(tech: PlottableTechnician, position: InstanceType<NonNullable<Window['kakao']>['maps']['LatLng']>) => {
			const kakao = kakaoRef.current;
			const map = mapRef.current;
			if (!kakao || !map || isMobileRef.current) return;

			const html = buildHoverPreviewHtmlForTech(tech);
			if (!tooltipOverlayRef.current) {
				tooltipOverlayRef.current = createMapHoverPreviewOverlay(kakao, position, html);
			} else {
				tooltipOverlayRef.current.setContent(html);
				tooltipOverlayRef.current.setPosition(position);
			}
			tooltipOverlayRef.current.setMap(map);
		},
		[buildHoverPreviewHtmlForTech],
	);

	const hideMarkerPopover = useCallback(() => {
		markerPopoverRef.current?.setMap(null);
	}, []);

	const clearRoutePolyline = useCallback(() => {
		try {
			routePolylineRef.current?.setMap(null);
		} catch (err) {
			logKakaoMapError('clearRoutePolyline', err);
		}
		routePolylineRef.current = null;
	}, []);

	const updateMarkerPopover = useCallback(
		(tech: PlottableTechnician) => {
			const kakao = kakaoRef.current;
			const map = mapRef.current;
			if (!kakao || !map || !showMarkerPopover) return;

			const position = new kakao.maps.LatLng(tech.shopLatitude, tech.shopLongitude);
			const personName = tech.userNickname || tech.userFullName || '';
			const shopName = tech.shopName?.trim() || '';
			const headline = personName || shopName || t('search.map.unknownTechnician');
			const rating = tech.averageRating ?? 0;
			const ratingLabel =
				rating > 0
					? t('search.map.ratingTooltip', { rating: rating.toFixed(1) })
					: t('search.map.noRating');
			const reviewLabel = t('search.map.reviewCount', { count: tech.reviewCount ?? 0 });
			const avatarUrl = resolveProfileImageUrl(tech.userProfileImage) || DEFAULT_AVATAR;

			const html = buildMarkerOverlayHtml({
				name: headline,
				shopName: shopName && personName ? shopName : undefined,
				ratingLabel,
				reviewLabel,
				avatarUrl,
			});

			if (!markerPopoverRef.current) {
				markerPopoverRef.current = createMapMarkerPopoverOverlay(kakao, position, html);
			} else {
				markerPopoverRef.current.setContent(html);
				markerPopoverRef.current.setPosition(position);
			}
			markerPopoverRef.current.setMap(map);
		},
		[showMarkerPopover, t],
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

		Object.values(avatarOverlayRefs.current).forEach((overlay) => {
			try {
				overlay.setMap(null);
			} catch (err) {
				logKakaoMapError('clearAvatarOverlay', err);
			}
		});
		avatarOverlayRefs.current = {};
		hideHoverPreview();
		hideMarkerPopover();
	}, [hideMarkerPopover, hideHoverPreview]);

	const syncMapView = useCallback((techs: PlottableTechnician[], center: MapPoint) => {
		const kakao = kakaoRef.current;
		const map = mapRef.current;
		if (!kakao || !map) return;

		const techPoints: MapPoint[] = techs.map((tech) => ({
			lat: tech.shopLatitude,
			lng: tech.shopLongitude,
		}));

		if (techPoints.length) {
			fitMapToTechnicians(kakao, map, techPoints, { singlePointLevel: variant === 'expanded' ? 6 : 7 });
		} else {
			map.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
			map.setLevel(variant === 'expanded' ? 7 : 8);
		}
		scheduleMapRelayout(map);
	}, [variant]);

	const rebuildMarkers = useCallback(() => {
		const kakao = kakaoRef.current;
		const map = mapRef.current;
		if (!kakao || !map || !tilesReady) return;

		clearMarkerLayer();

		const mapLevel = map.getLevel();
		const minPixelGap = getMinMarkerPixelGap(kakao, map, plottableTechnicians);
		const useAvatarMarkers = shouldUseAvatarMapMarkers(
			mapLevel,
			minPixelGap,
			plottableTechnicians.length,
		);
		markerModeRef.current = useAvatarMarkers ? 'avatar' : 'pin';

		if (useAvatarMarkers) {
			plottableTechnicians.forEach((tech) => {
				const position = new kakao.maps.LatLng(tech.shopLatitude, tech.shopLongitude);
				const isSelected = tech._id === selectedIdRef.current;
				const label = getAvatarMarkerLabel(
					tech.userNickname,
					tech.userFullName,
					tech.shopName,
					t('search.map.unknownTechnician'),
				);
				const avatarUrl = resolveProfileImageUrl(tech.userProfileImage) || DEFAULT_AVATAR;
				const element = createAvatarMapMarkerElement({
					technicianId: tech._id,
					label,
					avatarUrl,
					isSelected,
					onSelect: (id) => {
						suppressMapClickRef.current = true;
						onSelectTechnicianRef.current(id);
						window.setTimeout(() => {
							suppressMapClickRef.current = false;
						}, 0);
					},
					onHoverEnter: !isMobileRef.current
						? () => showHoverPreview(tech, position)
						: undefined,
					onHoverLeave: !isMobileRef.current ? () => hideHoverPreview() : undefined,
				});

				const overlay = new kakao.maps.CustomOverlay({
					map,
					position,
					content: element,
					yAnchor: 1.12,
					xAnchor: 0.5,
					zIndex: isSelected ? 6 : 4,
				});
				avatarOverlayRefs.current[tech._id] = overlay;
			});

			return;
		}

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

			const clickHandler = (evt?: unknown) => {
				if (evt && typeof evt === 'object' && 'stopPropagation' in evt) {
					(evt as { stopPropagation: () => void }).stopPropagation();
				}
				suppressMapClickRef.current = true;
				onSelectTechnicianRef.current(tech._id);
				window.setTimeout(() => {
					suppressMapClickRef.current = false;
				}, 0);
			};
			kakao.maps.event.addListener(marker, 'click', clickHandler);
			markerListenersRef.current.push({ target: marker, type: 'click', handler: clickHandler });

			if (!isMobileRef.current) {
				const mouseoverHandler = () => showHoverPreview(tech, position);
				const mouseoutHandler = () => hideHoverPreview();
				kakao.maps.event.addListener(marker, 'mouseover', mouseoverHandler);
				kakao.maps.event.addListener(marker, 'mouseout', mouseoutHandler);
				markerListenersRef.current.push(
					{ target: marker, type: 'mouseover', handler: mouseoverHandler },
					{ target: marker, type: 'mouseout', handler: mouseoutHandler },
				);
			}
		});

		if (markers.length) {
			try {
				clustererRef.current = attachTechnicianMarkers(kakao, map, markers);
			} catch (err) {
				logKakaoMapError('rebuildMarkers', err);
			}
		}
	}, [
		clearMarkerLayer,
		hideHoverPreview,
		plottableTechnicians,
		routeVisible,
		showHoverPreview,
		tilesReady,
		t,
	]);

	const refreshMarkerMode = useCallback(() => {
		const kakao = kakaoRef.current;
		const map = mapRef.current;
		if (!kakao || !map || !tilesReady) return;

		const mapLevel = map.getLevel();
		const minPixelGap = getMinMarkerPixelGap(kakao, map, plottableTechnicians);
		const nextMode = shouldUseAvatarMapMarkers(mapLevel, minPixelGap, plottableTechnicians.length)
			? 'avatar'
			: 'pin';

		if (nextMode !== markerModeRef.current) {
			rebuildMarkers();
		}
	}, [plottableTechnicians, rebuildMarkers, tilesReady]);

	useEffect(() => {
		refreshMarkerModeRef.current = refreshMarkerMode;
	}, [refreshMarkerMode]);

	const applyLocation = useCallback(
		async (lat: number, lng: number, fallbackLabel?: string, commitGeo = true) => {
			const kakao = kakaoRef.current;
			const center = { lat, lng };
			setUserPoint(center);
			onUserPointChangeRef.current?.(center);

			if (kakao && mapRef.current) {
				const latlng = new kakao.maps.LatLng(lat, lng);
				userMarkerRef.current?.setPosition(latlng);
				if (!routeVisible) {
					mapRef.current.setCenter(latlng);
					mapRef.current.setLevel(variant === 'expanded' ? 6 : 7);
					scheduleMapRelayout(mapRef.current);
				}
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

			onLocationChangeRef.current?.({ label, lat, lng, commitGeo });
		},
		[routeVisible, t, variant],
	);

	const detectLocation = useCallback(
		async (options?: { commitGeo?: boolean }) => {
			const commitGeo = options?.commitGeo ?? true;
			setLocating(true);
			try {
				const position = await getCurrentPosition();
				const { latitude: lat, longitude: lng } = position.coords;

				if (isWithinKorea(lat, lng)) {
					await applyLocation(lat, lng, undefined, commitGeo);
				} else {
					await applyLocation(
						SEOUL_CENTER.lat,
						SEOUL_CENTER.lng,
						t('search.location.outsideKorea'),
						false,
					);
				}
			} catch (err) {
				logKakaoMapError('geolocation', err);
				await applyLocation(
					SEOUL_CENTER.lat,
					SEOUL_CENTER.lng,
					t('search.location.placeholder'),
					false,
				);
			} finally {
				setLocating(false);
			}
		},
		[applyLocation, t],
	);

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
					level: variant === 'expanded' ? 7 : 8,
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
					zIndex: 5,
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
					if (suppressMapClickRef.current) return;
					onSelectTechnicianRef.current(null);
				});

				kakao.maps.event.addListener(map, 'zoom_changed', () => {
					refreshMarkerModeRef.current();
				});
				kakao.maps.event.addListener(map, 'idle', () => {
					refreshMarkerModeRef.current();
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
				onLocationChangeRef.current?.({
					label: t('search.location.placeholder') ?? '',
					lat: SEOUL_CENTER.lat,
					lng: SEOUL_CENTER.lng,
					commitGeo: false,
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
			clearRoutePolyline();
			hideHoverPreview();
			hideMarkerPopover();
			tooltipOverlayRef.current = null;
			markerPopoverRef.current = null;
			destroyKakaoMap(userMarkerRef.current, mapContainerRef.current);
			mapRef.current = null;
			userMarkerRef.current = null;
			kakaoRef.current = null;
			clustererRef.current = null;
			defaultMarkerImageRef.current = null;
			selectedMarkerImageRef.current = null;
		};
	}, [
		clearMarkerLayer,
		clearRoutePolyline,
		clearTilesTimer,
		hideMarkerPopover,
		hideHoverPreview,
		markTilesVisible,
		startTilesTimer,
		t,
		variant,
	]);

	useEffect(() => {
		if (tilesReady && autoDetectLocation && recenterRequestId === 0) {
			detectLocation({ commitGeo: false });
		}
	}, [autoDetectLocation, detectLocation, recenterRequestId, tilesReady]);

	useEffect(() => {
		if (tilesReady && recenterRequestId > 0) {
			hasFittedMapRef.current = false;
			detectLocation({ commitGeo: true });
		}
	}, [detectLocation, recenterRequestId, tilesReady]);

	useEffect(() => {
		if (!tilesReady || routeVisible || hasFittedMapRef.current) return;
		if (!plottableTechnicians.length) return;
		syncMapView(plottableTechnicians, userPoint);
		hasFittedMapRef.current = true;
	}, [plottableTechnicians, routeVisible, syncMapView, tilesReady, userPoint]);

	useEffect(() => {
		if (tilesReady) {
			rebuildMarkers();
		}
	}, [rebuildMarkers, tilesReady]);

	useEffect(() => {
		const kakao = kakaoRef.current;
		const defaultImg = defaultMarkerImageRef.current;
		const selectedImg = selectedMarkerImageRef.current;
		if (!kakao) return;

		if (markerModeRef.current === 'avatar') {
			if (tilesReady) rebuildMarkers();
			return;
		}

		if (!defaultImg || !selectedImg) return;

		Object.entries(markerRefs.current).forEach(([id, marker]) => {
			const isSelected = id === selectedTechnicianId;
			marker.setImage(isSelected ? selectedImg : defaultImg);
			marker.setZIndex(isSelected ? 3 : 1);
		});
	}, [rebuildMarkers, selectedTechnicianId, tilesReady]);

	useEffect(() => {
		if (selectedTechnician && showMarkerPopover) {
			updateMarkerPopover(selectedTechnician);
			return;
		}
		hideMarkerPopover();
	}, [hideMarkerPopover, selectedTechnician, showMarkerPopover, updateMarkerPopover]);

	useEffect(() => {
		if (!routeVisible || !routeTechnicianId) {
			clearRoutePolyline();
			onRouteInfoChange?.(null);
			onRouteErrorChange?.(null);
			onRouteLoadingChange?.(false);
			return;
		}

		const tech = plottableTechnicians.find((item) => item._id === routeTechnicianId);
		if (!tech) return;

		let cancelled = false;
		onRouteLoadingChange?.(true);
		onRouteErrorChange?.(null);

		void fetchMapRoute(userPoint, { lat: tech.shopLatitude, lng: tech.shopLongitude })
			.then((info) => {
				if (cancelled) return;
				const kakao = kakaoRef.current;
				const map = mapRef.current;
				if (!kakao || !map) return;

				clearRoutePolyline();
				routePolylineRef.current = drawRoutePolyline(kakao, map, info.path);
				fitMapToRoute(kakao, map, [
					userPoint,
					{ lat: tech.shopLatitude, lng: tech.shopLongitude },
					...info.path,
				]);
				onRouteInfoChange?.(info);
				onRouteErrorChange?.(null);
				onRouteLoadingChange?.(false);
			})
			.catch((err: unknown) => {
				if (cancelled) return;
				clearRoutePolyline();
				onRouteInfoChange?.(null);
				onRouteErrorChange?.(
					err instanceof MapRouteError ? err.message : 'Unable to calculate road route',
				);
				onRouteLoadingChange?.(false);
			});

		return () => {
			cancelled = true;
		};
	}, [
		clearRoutePolyline,
		onRouteErrorChange,
		onRouteInfoChange,
		onRouteLoadingChange,
		plottableTechnicians,
		routeTechnicianId,
		routeVisible,
		userPoint,
	]);

	const showGridBackground = mapError || !tilesVisible;
	const mapShellClass = [
		'fixora-search-location__map',
		showGridBackground ? 'fixora-search-location__map--fallback' : '',
		variant === 'expanded' ? 'fixora-search-location__map--expanded' : '',
		mapClassName,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={mapShellClass}>
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
			{onExpandClick && variant === 'compact' && (
				<button
					type="button"
					className="fixora-search-location__map-expand"
					onClick={(event) => {
						event.stopPropagation();
						onExpandClick();
					}}
					aria-label={t('search.map.expandMap')}
					title={t('search.map.expandMap')}
				>
					<FullscreenIcon fontSize="small" />
				</button>
			)}
		</div>
	);
};

export { distanceKmBetween };
export default TechnicianInteractiveMap;
