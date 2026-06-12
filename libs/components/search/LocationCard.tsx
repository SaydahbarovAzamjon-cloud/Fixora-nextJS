import React from 'react';
import { useTranslation } from 'next-i18next';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';

const MAP_DOTS = [
	{ top: '28%', left: '22%' },
	{ top: '45%', left: '58%' },
	{ top: '62%', left: '35%' },
	{ top: '38%', left: '78%' },
];

const LocationCard = () => {
	const { t } = useTranslation('common');

	return (
		<div className="fixora-search-location">
			<div className="fixora-search-location__map" aria-hidden="true">
				{MAP_DOTS.map((dot, index) => (
					<span key={index} className="fixora-search-location__dot" style={{ top: dot.top, left: dot.left }} />
				))}
			</div>
			<div className="fixora-search-location__row">
				<div className="fixora-search-location__label">
					<strong>{t('search.location.title')}</strong>
					<span>{t('search.location.placeholder')}</span>
				</div>
				<button type="button" className="fixora-search-location__recenter" aria-label={t('search.location.title')}>
					<GpsFixedIcon fontSize="small" />
				</button>
			</div>
		</div>
	);
};

export default LocationCard;
