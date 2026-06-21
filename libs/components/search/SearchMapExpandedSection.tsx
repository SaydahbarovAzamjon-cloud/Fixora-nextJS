import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import type { LocationChangePayload, MapPoint } from '../../kakao-maps';
import { TechniciansInquiry, TechnicianSummary } from '../../types/fixora/fixora';
import { distanceKmBetween, getPlottableTechnicians, getMapTechniciansQueryInput } from '../../utils/technicianMap';
import type { MapRouteInfo } from '../../utils/technicianMapRoute';
import TechnicianInteractiveMap from './TechnicianInteractiveMap';
import TechnicianMapBottomSheet from './map/TechnicianMapBottomSheet';
import TechnicianMapProfilePanel from './map/TechnicianMapProfilePanel';
import { GET_TECHNICIANS } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';

interface SearchMapExpandedSectionProps {
	searchFilter: TechniciansInquiry;
	locationLabel: string;
	selectedTechnicianId: string | null;
	onSelectTechnician: (id: string | null) => void;
	onLocationChange: (payload: LocationChangePayload) => void;
	onCollapse: () => void;
}

const MAP_TECHNICIAN_LIMIT = 100;

const SearchMapExpandedSection = ({
	searchFilter,
	locationLabel,
	selectedTechnicianId,
	onSelectTechnician,
	onLocationChange,
	onCollapse,
}: SearchMapExpandedSectionProps) => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';

	const [userPoint, setUserPoint] = useState<MapPoint | null>(null);
	const [routeVisible, setRouteVisible] = useState(false);
	const [routeInfo, setRouteInfo] = useState<MapRouteInfo | null>(null);
	const [routeLoading, setRouteLoading] = useState(false);
	const [routeError, setRouteError] = useState<string | null>(null);

	const mapQueryInput = useMemo(
		() => getMapTechniciansQueryInput(searchFilter, MAP_TECHNICIAN_LIMIT),
		[searchFilter],
	);

	const { data: mapData } = useQuery(GET_TECHNICIANS, {
		variables: { input: mapQueryInput },
		fetchPolicy: 'cache-and-network',
	});

	const selectedTechnician = useMemo(() => {
		const list = (mapData?.getTechnicians?.list ?? []) as TechnicianSummary[];
		return getPlottableTechnicians(list).find((tech) => tech._id === selectedTechnicianId) ?? null;
	}, [mapData, selectedTechnicianId]);

	const distanceKm = useMemo(() => {
		if (!selectedTechnician || !userPoint) return null;
		return distanceKmBetween(userPoint, {
			lat: selectedTechnician.shopLatitude,
			lng: selectedTechnician.shopLongitude,
		});
	}, [selectedTechnician, userPoint]);

	const selectTechnicianHandler = useCallback(
		(id: string | null) => {
			onSelectTechnician(id);
			if (!id) {
				setRouteVisible(false);
				setRouteInfo(null);
				setRouteError(null);
			}
		},
		[onSelectTechnician],
	);

	const clearRouteHandler = useCallback(() => {
		setRouteVisible(false);
		setRouteInfo(null);
		setRouteError(null);
	}, []);

	const showRouteHandler = useCallback(() => {
		if (!selectedTechnicianId) return;
		setRouteError(null);
		setRouteVisible(true);
	}, [selectedTechnicianId]);

	return (
		<section className="fixora-search-map-expanded" aria-label={t('search.map.expandedTitle')}>
			<div className="fixora-search-map-expanded__toolbar">
				<div className="fixora-search-map-expanded__location">
					<GpsFixedIcon fontSize="small" />
					<span>{locationLabel}</span>
				</div>
				<button
					type="button"
					className="fixora-search-map-expanded__collapse"
					onClick={onCollapse}
					aria-label={t('search.map.collapseMap')}
				>
					<CloseFullscreenIcon fontSize="small" />
					<span>{t('search.map.collapseMap')}</span>
				</button>
			</div>

			<div className="fixora-search-map-expanded__body">
				<div className="fixora-search-map-expanded__map-wrap">
					<TechnicianInteractiveMap
						searchFilter={searchFilter}
						selectedTechnicianId={selectedTechnicianId}
						onSelectTechnician={selectTechnicianHandler}
						onLocationChange={onLocationChange}
						onUserPointChange={setUserPoint}
						variant="expanded"
						showMarkerPopover
						routeVisible={routeVisible}
						routeTechnicianId={selectedTechnicianId}
						onRouteInfoChange={setRouteInfo}
						onRouteLoadingChange={setRouteLoading}
						onRouteErrorChange={setRouteError}
						autoDetectLocation
					/>

					{isMobile && selectedTechnician && (
						<TechnicianMapBottomSheet
							open
							technician={selectedTechnician}
							distanceKm={routeInfo?.distanceKm ?? distanceKm}
							onClose={() => selectTechnicianHandler(null)}
							expandedProfile
							routeInfo={routeInfo}
							routeLoading={routeLoading}
							routeActive={routeVisible}
							routeError={routeError}
							onShowRoute={showRouteHandler}
							onClearRoute={clearRouteHandler}
						/>
					)}
				</div>

				{!isMobile && (
					<aside className="fixora-search-map-expanded__panel">
						{selectedTechnician ? (
							<TechnicianMapProfilePanel
								technician={selectedTechnician}
								distanceKm={distanceKm}
								routeInfo={routeInfo}
								routeLoading={routeLoading}
								routeActive={routeVisible}
								routeError={routeError}
								onShowRoute={showRouteHandler}
								onClearRoute={clearRouteHandler}
								onClose={() => selectTechnicianHandler(null)}
							/>
						) : (
							<div className="fixora-search-map-expanded__empty">
								<p>{t('search.map.selectTechnician')}</p>
							</div>
						)}
					</aside>
				)}
			</div>
		</section>
	);
};

export default SearchMapExpandedSection;
