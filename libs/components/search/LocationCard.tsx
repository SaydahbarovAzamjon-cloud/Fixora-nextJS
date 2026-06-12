import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import {
	getCurrentPosition,
	loadKakaoMapsSdk,
	reverseGeocode,
	SEOUL_CENTER,
	type KakaoMap,
	type KakaoMarker,
} from '../../kakao-maps';

interface LocationCardProps {
	locationLabel: string;
	onLocationChange: (location: string) => void;
}

const LocationCard = ({ locationLabel, onLocationChange }: LocationCardProps) => {
	const { t } = useTranslation('common');
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<KakaoMap | null>(null);
	const markerRef = useRef<KakaoMarker | null>(null);
	const kakaoRef = useRef<NonNullable<Window['kakao']> | null>(null);
	const onLocationChangeRef = useRef(onLocationChange);
	const [loading, setLoading] = useState(true);
	const [mapError, setMapError] = useState(false);
	const [mapReady, setMapReady] = useState(false);

	useEffect(() => {
		onLocationChangeRef.current = onLocationChange;
	}, [onLocationChange]);

	const applyLocation = useCallback(
		async (lat: number, lng: number, fallbackLabel?: string) => {
			const kakao = kakaoRef.current;
			if (!kakao || !mapRef.current) return;

			const latlng = new kakao.maps.LatLng(lat, lng);
			mapRef.current.setCenter(latlng);
			markerRef.current?.setPosition(latlng);

			try {
				const address = await reverseGeocode(kakao, lat, lng);
				onLocationChangeRef.current(address || fallbackLabel || t('search.location.placeholder'));
			} catch {
				onLocationChangeRef.current(fallbackLabel || t('search.location.placeholder'));
			}
		},
		[t],
	);

	const detectLocation = useCallback(async () => {
		if (!mapReady) return;
		setLoading(true);
		try {
			const position = await getCurrentPosition();
			await applyLocation(position.coords.latitude, position.coords.longitude);
		} catch {
			await applyLocation(SEOUL_CENTER.lat, SEOUL_CENTER.lng, t('search.location.placeholder'));
		} finally {
			setLoading(false);
		}
	}, [applyLocation, mapReady, t]);

	useEffect(() => {
		let cancelled = false;

		const initMap = async () => {
			if (!mapContainerRef.current) return;

			try {
				const kakao = await loadKakaoMapsSdk();
				if (cancelled || !mapContainerRef.current) return;

				kakaoRef.current = kakao;
				const center = new kakao.maps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng);
				const map = new kakao.maps.Map(mapContainerRef.current, { center, level: 8 });
				const marker = new kakao.maps.Marker({ map, position: center });

				mapRef.current = map;
				markerRef.current = marker;
				setMapReady(true);
			} catch {
				if (!cancelled) {
					setMapError(true);
					setLoading(false);
					onLocationChangeRef.current(t('search.location.placeholder'));
				}
			}
		};

		initMap();

		return () => {
			cancelled = true;
		};
	}, [t]);

	useEffect(() => {
		if (mapReady) {
			detectLocation();
		}
	}, [mapReady, detectLocation]);

	return (
		<div className="fixora-search-location">
			<div className={`fixora-search-location__map${mapError ? ' fixora-search-location__map--fallback' : ''}`}>
				<div ref={mapContainerRef} className="fixora-search-location__map-canvas" />
				{mapError && (
					<div className="fixora-search-location__map-fallback" aria-hidden="true">
						<span className="fixora-search-location__dot" style={{ top: '28%', left: '22%' }} />
						<span className="fixora-search-location__dot" style={{ top: '45%', left: '58%' }} />
						<span className="fixora-search-location__dot" style={{ top: '62%', left: '35%' }} />
						<span className="fixora-search-location__dot" style={{ top: '38%', left: '78%' }} />
					</div>
				)}
				{loading && <div className="fixora-search-location__map-loading">{t('search.location.detecting')}</div>}
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
					disabled={loading || !mapReady}
				>
					<GpsFixedIcon fontSize="small" />
				</button>
			</div>
		</div>
	);
};

export default LocationCard;
