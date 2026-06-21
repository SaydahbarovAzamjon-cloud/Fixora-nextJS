import React, { useEffect, useState } from 'react';
import TechnicianMapPreviewCard from './TechnicianMapPreviewCard';
import TechnicianMapProfilePanel from './TechnicianMapProfilePanel';
import { TechnicianSummary } from '../../../types/fixora/fixora';
import type { MapRouteInfo } from '../../../utils/technicianMapRoute';

export interface TechnicianMapBottomSheetProps {
	open: boolean;
	technician: TechnicianSummary | null;
	distanceKm?: number | null;
	onClose: () => void;
	expandedProfile?: boolean;
	routeInfo?: MapRouteInfo | null;
	routeLoading?: boolean;
	routeActive?: boolean;
	routeError?: string | null;
	onShowRoute?: () => void;
	onClearRoute?: () => void;
}

const TechnicianMapBottomSheet = ({
	open,
	technician,
	distanceKm,
	onClose,
	expandedProfile = false,
	routeInfo,
	routeLoading = false,
	routeActive = false,
	routeError = null,
	onShowRoute,
	onClearRoute,
}: TechnicianMapBottomSheetProps) => {
	const [mounted, setMounted] = useState(open);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (open) {
			setMounted(true);
			const frame = window.requestAnimationFrame(() => setVisible(true));
			return () => window.cancelAnimationFrame(frame);
		}

		setVisible(false);
		const timer = window.setTimeout(() => setMounted(false), 280);
		return () => window.clearTimeout(timer);
	}, [open]);

	if (!mounted || !technician) return null;

	return (
		<div
			className={`fixora-map-sheet${visible ? ' fixora-map-sheet--open' : ''}`}
			role="dialog"
			aria-modal="true"
		>
			<button type="button" className="fixora-map-sheet__backdrop" onClick={onClose} aria-label="close" />
			<div className="fixora-map-sheet__panel">
				<div className="fixora-map-sheet__handle" aria-hidden="true" />
				{expandedProfile ? (
					<TechnicianMapProfilePanel
						technician={technician}
						distanceKm={distanceKm}
						routeInfo={routeInfo}
						routeLoading={routeLoading}
						routeActive={routeActive}
						routeError={routeError}
						onShowRoute={onShowRoute}
						onClearRoute={onClearRoute}
						onClose={onClose}
						className="fixora-map-profile--sheet"
					/>
				) : (
					<TechnicianMapPreviewCard
						technician={technician}
						distanceKm={distanceKm}
						onClose={onClose}
						className="fixora-map-preview--sheet"
					/>
				)}
			</div>
		</div>
	);
};

export default TechnicianMapBottomSheet;
