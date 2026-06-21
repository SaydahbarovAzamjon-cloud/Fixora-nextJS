import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { useQuery } from '@apollo/client';
import { GET_TECHNICIANS } from '../../../apollo/user/query';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import type { LocationChangePayload, MapPoint } from '../../kakao-maps';
import { TechniciansInquiry, TechnicianSummary } from '../../types/fixora/fixora';
import { distanceKmBetween, getPlottableTechnicians, getMapTechniciansQueryInput } from '../../utils/technicianMap';
import TechnicianInteractiveMap from './TechnicianInteractiveMap';
import TechnicianMapBottomSheet from './map/TechnicianMapBottomSheet';
import TechnicianMapPreviewCard from './map/TechnicianMapPreviewCard';

interface LocationCardProps {
	locationLabel: string;
	searchFilter: TechniciansInquiry;
	onLocationChange: (payload: LocationChangePayload) => void;
	selectedTechnicianId?: string | null;
	onSelectTechnician?: (id: string | null) => void;
	onExpandMap?: () => void;
	mapExpanded?: boolean;
}

const MAP_TECHNICIAN_LIMIT = 100;

const LocationCard = ({
	locationLabel,
	searchFilter,
	onLocationChange,
	selectedTechnicianId: controlledSelectedId,
	onSelectTechnician: controlledOnSelect,
	onExpandMap,
	mapExpanded = false,
}: LocationCardProps) => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';

	const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
	const [userPoint, setUserPoint] = useState<MapPoint | null>(null);
	const [locating, setLocating] = useState(false);
	const [recenterRequestId, setRecenterRequestId] = useState(0);

	const selectedTechnicianId = controlledSelectedId ?? internalSelectedId;
	const onSelectTechnician = controlledOnSelect ?? setInternalSelectedId;

	const mapQueryInput = useMemo(
		() => getMapTechniciansQueryInput(searchFilter, MAP_TECHNICIAN_LIMIT),
		[searchFilter],
	);

	const { data: mapData } = useQuery(GET_TECHNICIANS, {
		variables: { input: mapQueryInput },
		fetchPolicy: 'cache-and-network',
		skip: mapExpanded,
	});

	const selectedTechnician = useMemo(() => {
		const list = (mapData?.getTechnicians?.list ?? []) as TechnicianSummary[];
		return getPlottableTechnicians(list).find((tech) => tech._id === selectedTechnicianId) ?? null;
	}, [mapData, selectedTechnicianId]);

	const selectedDistanceKm = useMemo(() => {
		if (!selectedTechnician || !userPoint) return null;
		return distanceKmBetween(userPoint, {
			lat: selectedTechnician.shopLatitude,
			lng: selectedTechnician.shopLongitude,
		});
	}, [selectedTechnician, userPoint]);

	const detectLocationHandler = useCallback(() => {
		setLocating(true);
		setRecenterRequestId((value) => value + 1);
		window.setTimeout(() => setLocating(false), 1200);
	}, []);

	const hasPreview = !!selectedTechnician && !mapExpanded;

	return (
		<div className={`fixora-search-location${hasPreview ? ' fixora-search-location--has-preview' : ''}`}>
			<div className="fixora-search-location__map-stage">
				{mapExpanded ? (
					<div className="fixora-search-location__map-placeholder">
						<p>{t('search.map.expandedHint')}</p>
					</div>
				) : (
					<TechnicianInteractiveMap
						searchFilter={searchFilter}
						selectedTechnicianId={selectedTechnicianId}
						onSelectTechnician={onSelectTechnician}
						onLocationChange={onLocationChange}
						onUserPointChange={setUserPoint}
						variant="compact"
						onExpandClick={onExpandMap}
						recenterRequestId={recenterRequestId}
					/>
				)}

				{isMobile && hasPreview && selectedTechnician && (
					<TechnicianMapBottomSheet
						open
						technician={selectedTechnician}
						distanceKm={selectedDistanceKm}
						onClose={() => onSelectTechnician(null)}
					/>
				)}

				{!isMobile && hasPreview && selectedTechnician && (
					<aside className="fixora-search-location__preview-panel">
						<TechnicianMapPreviewCard
							technician={selectedTechnician}
							distanceKm={selectedDistanceKm}
							onClose={() => onSelectTechnician(null)}
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
					onClick={detectLocationHandler}
					disabled={locating}
				>
					<GpsFixedIcon fontSize="small" />
				</button>
			</div>
		</div>
	);
};

export default LocationCard;
