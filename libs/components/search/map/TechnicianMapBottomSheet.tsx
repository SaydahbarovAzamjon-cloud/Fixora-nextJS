import React, { useEffect, useState } from 'react';
import TechnicianMapPreviewCard from './TechnicianMapPreviewCard';
import { TechnicianSummary } from '../../../types/fixora/fixora';

export interface TechnicianMapBottomSheetProps {
	open: boolean;
	technician: TechnicianSummary | null;
	distanceKm?: number | null;
	onClose: () => void;
}

const TechnicianMapBottomSheet = ({
	open,
	technician,
	distanceKm,
	onClose,
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
				<TechnicianMapPreviewCard
					technician={technician}
					distanceKm={distanceKm}
					onClose={onClose}
					className="fixora-map-preview--sheet"
				/>
			</div>
		</div>
	);
};

export default TechnicianMapBottomSheet;
