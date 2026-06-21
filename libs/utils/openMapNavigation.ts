export interface MapNavigationTarget {
	lat: number;
	lng: number;
	name?: string;
}

function buildUrls(target: MapNavigationTarget) {
	const { lat, lng } = target;
	const label = target.name?.trim() || 'Technician';
	const encodedLabel = encodeURIComponent(label);

	return {
		kakaoWeb: `https://map.kakao.com/link/to/${encodedLabel},${lat},${lng}`,
		kakaoRouteApp: `kakaomap://route?ep=${lat},${lng}&by=CAR`,
		kakaoNaviApp: `kakaonavi://navigate?destination=${lat},${lng}&destination_name=${encodedLabel}`,
		google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
		geo: `geo:${lat},${lng}?q=${lat},${lng}(${encodedLabel})`,
	};
}

/** Open external navigation — Kakao first, then Google, then device geo URI. */
export function openTechnicianNavigation(target: MapNavigationTarget): void {
	if (!Number.isFinite(target.lat) || !Number.isFinite(target.lng)) return;

	const urls = buildUrls(target);
	const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

	if (isMobile) {
		const tryAppScheme = (scheme: string) => {
			window.location.href = scheme;
		};

		tryAppScheme(urls.kakaoNaviApp);
		window.setTimeout(() => tryAppScheme(urls.kakaoRouteApp), 350);
		window.setTimeout(() => {
			window.open(urls.kakaoWeb, '_blank', 'noopener,noreferrer');
		}, 900);
		window.setTimeout(() => {
			window.open(urls.google, '_blank', 'noopener,noreferrer');
		}, 1600);
		window.setTimeout(() => {
			window.location.href = urls.geo;
		}, 2200);
		return;
	}

	const opened = window.open(urls.kakaoWeb, '_blank', 'noopener,noreferrer');
	if (!opened) {
		window.open(urls.google, '_blank', 'noopener,noreferrer');
	}
}
