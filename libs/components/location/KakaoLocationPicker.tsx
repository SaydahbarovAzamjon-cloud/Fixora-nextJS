import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import SearchIcon from '@mui/icons-material/Search';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import {
	SEOUL_CENTER,
	bindMapIdleListener,
	createUserMarkerImage,
	destroyKakaoMap,
	formatCoordLabel,
	getCurrentPosition,
	isWithinKorea,
	loadKakaoMapsSdk,
	logKakaoMapError,
	reverseGeocode,
	scheduleMapRelayout,
	searchLocations,
	type LocationSearchResult,
	type MapPoint,
	waitForNonZeroSize,
} from '../../kakao-maps';
import type { KakaoMap, KakaoMarker } from '../../kakao-maps';

interface KakaoLocationPickerProps {
	value: string;
	onChange: (value: string) => void;
	label?: string;
	onPointChange?: (point: MapPoint | null) => void;
	initialPoint?: MapPoint | null;
}

const KakaoLocationPicker = ({ value, onChange, label, onPointChange, initialPoint = null }: KakaoLocationPickerProps) => {
	const { t } = useTranslation('common');
	const [searchText, setSearchText] = useState(value);
	const [results, setResults] = useState<LocationSearchResult[]>([]);
	const [searching, setSearching] = useState(false);
	const [locating, setLocating] = useState(false);
	const [mapError, setMapError] = useState(false);
	const [tilesVisible, setTilesVisible] = useState(false);
	const [showResults, setShowResults] = useState(false);

	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<KakaoMap | null>(null);
	const markerRef = useRef<KakaoMarker | null>(null);
	const kakaoRef = useRef<NonNullable<Window['kakao']> | null>(null);
	const initGenerationRef = useRef(0);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const onChangeRef = useRef(onChange);
	const onPointChangeRef = useRef(onPointChange);
	const valueRef = useRef(value);
	const initialPointRef = useRef(initialPoint);

	useEffect(() => {
		initialPointRef.current = initialPoint;
	}, [initialPoint]);

	useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	useEffect(() => {
		onPointChangeRef.current = onPointChange;
	}, [onPointChange]);

	useEffect(() => {
		valueRef.current = value;
		setSearchText(value);
	}, [value]);

	const moveMarker = useCallback((point: MapPoint) => {
		const kakao = kakaoRef.current;
		const map = mapRef.current;
		if (!kakao || !map) return;
		const latlng = new kakao.maps.LatLng(point.lat, point.lng);
		markerRef.current?.setPosition(latlng);
		map.setCenter(latlng);
		scheduleMapRelayout(map);
		onPointChangeRef.current?.(point);
	}, []);

	const applyPoint = useCallback(
		async (point: MapPoint, fallbackLabel?: string) => {
			moveMarker(point);
			const kakao = kakaoRef.current;
			let nextLabel = fallbackLabel?.trim() ?? '';

			if (kakao) {
				const address = await reverseGeocode(kakao, point.lat, point.lng);
				if (address) nextLabel = address;
			}

			if (!nextLabel) {
				nextLabel = formatCoordLabel(point.lat, point.lng);
			}

			onChangeRef.current(nextLabel);
			setSearchText(nextLabel);
			setResults([]);
			setShowResults(false);
		},
		[moveMarker],
	);

	const detectLocation = useCallback(async () => {
		setLocating(true);
		try {
			const position = await getCurrentPosition();
			const { latitude: lat, longitude: lng } = position.coords;
			if (isWithinKorea(lat, lng)) {
				await applyPoint({ lat, lng });
			} else {
				await applyPoint(SEOUL_CENTER, t('search.location.outsideKorea'));
			}
		} catch (err) {
			logKakaoMapError('locationPicker.geolocation', err);
			await applyPoint(SEOUL_CENTER, t('search.location.placeholder'));
		} finally {
			setLocating(false);
		}
	}, [applyPoint, t]);

	const selectResult = useCallback(
		async (item: LocationSearchResult) => {
			await applyPoint({ lat: item.lat, lng: item.lng }, item.label);
		},
		[applyPoint],
	);

	useEffect(() => {
		const query = searchText.trim();
		if (!query || query === valueRef.current.trim()) {
			setResults([]);
			return;
		}

		const timer = window.setTimeout(async () => {
			setSearching(true);
			try {
				const kakao = kakaoRef.current ?? (await loadKakaoMapsSdk());
				kakaoRef.current = kakao;
				const found = await searchLocations(kakao, query);
				setResults(found);
				setShowResults(found.length > 0);
			} catch (err) {
				logKakaoMapError('locationPicker.search', err);
				setResults([]);
			} finally {
				setSearching(false);
			}
		}, 350);

		return () => window.clearTimeout(timer);
	}, [searchText]);

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
				});
				const marker = new kakao.maps.Marker({
					map,
					position: center,
					image: createUserMarkerImage(kakao),
					zIndex: 5,
				});

				mapRef.current = map;
				markerRef.current = marker;
				scheduleMapRelayout(map);
				bindMapIdleListener(kakao, map, () => setTilesVisible(true));

				resizeObserverRef.current?.disconnect();
				resizeObserverRef.current = new ResizeObserver(() => {
					if (mapRef.current) scheduleMapRelayout(mapRef.current);
				});
				resizeObserverRef.current.observe(mapContainerRef.current);

				kakao.maps.event.addListener(map, 'click', (mouseEvent: { latLng?: { getLat: () => number; getLng: () => number } }) => {
					const latlng = mouseEvent?.latLng;
					if (!latlng) return;
					void applyPoint({ lat: latlng.getLat(), lng: latlng.getLng() });
				});

				setMapError(false);
				setTilesVisible(false);

				const initial = valueRef.current.trim();
				const savedPoint = initialPointRef.current;
				if (
					savedPoint &&
					Number.isFinite(savedPoint.lat) &&
					Number.isFinite(savedPoint.lng)
				) {
					await applyPoint(savedPoint, initial || undefined);
				} else if (initial) {
					const found = await searchLocations(kakao, initial);
					if (found[0]) {
						const point = { lat: found[0].lat, lng: found[0].lng };
						moveMarker(point);
					}
				}
			} catch (err) {
				logKakaoMapError('locationPicker.initMap', err);
				if (generation !== initGenerationRef.current) return;
				setMapError(true);
				setTilesVisible(false);
			}
		};

		void initMap();

		return () => {
			initGenerationRef.current += 1;
			resizeObserverRef.current?.disconnect();
			resizeObserverRef.current = null;
			destroyKakaoMap(markerRef.current, mapContainerRef.current);
			mapRef.current = null;
			markerRef.current = null;
			kakaoRef.current = null;
		};
	}, [applyPoint, moveMarker]);

	const showFallback = mapError || !tilesVisible;

	return (
		<div className="fixora-mypage__location-picker">
			{label && <span className="fixora-input__label">{label}</span>}

			<div className="fixora-mypage__location-picker-search">
				<SearchIcon className="fixora-mypage__location-picker-search-icon" fontSize="small" />
				<input
					className="fixora-mypage__location-picker-input"
					type="text"
					value={searchText}
					placeholder={t('mypage.settings.locationSearchPlaceholder')}
					onChange={(e) => {
						setSearchText(e.target.value);
						setShowResults(true);
					}}
					onFocus={() => {
						if (results.length) setShowResults(true);
					}}
					onBlur={() => {
						window.setTimeout(() => setShowResults(false), 150);
					}}
				/>
				<button
					type="button"
					className="fixora-mypage__location-picker-gps"
					aria-label={t('search.location.recenter')}
					onClick={() => void detectLocation()}
					disabled={locating}
				>
					<GpsFixedIcon fontSize="small" />
				</button>
			</div>

			{showResults && results.length > 0 && (
				<ul className="fixora-mypage__location-picker-results" role="listbox">
					{results.map((item) => (
						<li key={`${item.label}-${item.lat}-${item.lng}`}>
							<button type="button" onMouseDown={() => void selectResult(item)}>
								{item.label}
							</button>
						</li>
					))}
				</ul>
			)}

			{searching && <p className="fixora-mypage__location-picker-hint">{t('mypage.settings.locationSearching')}</p>}

			<div
				className={`fixora-mypage__location-picker-map${showFallback ? ' fixora-mypage__location-picker-map--fallback' : ''}`}
			>
				<div ref={mapContainerRef} className="fixora-mypage__location-picker-canvas" />
				{showFallback && !locating && (
					<p className="fixora-mypage__location-picker-map-hint">{t('search.location.mapFallback')}</p>
				)}
				{locating && (
					<div className="fixora-mypage__location-picker-map-loading">{t('search.location.detecting')}</div>
				)}
			</div>

			<p className="fixora-mypage__location-picker-hint">{t('mypage.settings.locationMapHint')}</p>
			{value.trim() && <p className="fixora-mypage__location-picker-selected">{value}</p>}
		</div>
	);
};

export default KakaoLocationPicker;
