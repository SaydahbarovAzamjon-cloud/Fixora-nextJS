import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import StarIcon from '@mui/icons-material/Star';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import DirectionsIcon from '@mui/icons-material/Directions';
import NavigationIcon from '@mui/icons-material/Navigation';
import CloseIcon from '@mui/icons-material/Close';
import FixoraButton from '../../ui/FixoraButton';
import { TechnicianSummary } from '../../../types/fixora/fixora';
import { resolveProfileImageUrl } from '../../../utils/profileImage';
import { formatDistanceKm } from '../../../utils/technicianMap';
import { openTechnicianNavigation } from '../../../utils/openMapNavigation';
import type { MapRouteInfo } from '../../../utils/technicianMapRoute';
import { formatTravelMinutes, formatTaxiFareKrw } from '../../../utils/technicianMapRoute';

const DEFAULT_AVATAR = '/img/profile/defaultUser.svg';

export interface TechnicianMapProfilePanelProps {
	technician: TechnicianSummary;
	distanceKm?: number | null;
	routeInfo?: MapRouteInfo | null;
	routeLoading?: boolean;
	routeActive?: boolean;
	routeError?: string | null;
	onShowRoute?: () => void;
	onClearRoute?: () => void;
	onClose?: () => void;
	className?: string;
}

const TechnicianMapProfilePanel = ({
	technician,
	distanceKm,
	routeInfo,
	routeLoading = false,
	routeActive = false,
	routeError = null,
	onShowRoute,
	onClearRoute,
	onClose,
	className = '',
}: TechnicianMapProfilePanelProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();

	const clean = (value?: string | null) => {
		const trimmed = value?.trim() || '';
		return !trimmed || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined'
			? ''
			: trimmed;
	};
	const personName = clean(technician.userNickname) || clean(technician.userFullName);
	const shopName = clean(technician.shopName);
	const headline = personName || shopName || t('search.map.unknownTechnician');
	const rating = technician.averageRating ?? 0;
	const reviewCount = technician.reviewCount ?? 0;
	const address = clean(technician.userLocation);
	const bio = clean(technician.specialty);
	const avatarSrc = resolveProfileImageUrl(technician.userProfileImage);
	const displayDistanceKm = routeInfo?.distanceKm ?? distanceKm;

	const viewProfileHandler = () => {
		void router.push(`/technicians/${technician._id}`);
	};

	const navigateHandler = () => {
		if (technician.shopLatitude == null || technician.shopLongitude == null) return;
		openTechnicianNavigation({
			lat: technician.shopLatitude,
			lng: technician.shopLongitude,
			name: headline,
		});
	};

	const hasShopCoords =
		technician.shopLatitude != null && technician.shopLongitude != null;

	return (
		<article className={`fixora-map-profile${className ? ` ${className}` : ''}`}>
			{onClose && (
				<button
					type="button"
					className="fixora-map-profile__close"
					onClick={onClose}
					aria-label={t('search.map.closePreview')}
				>
					<CloseIcon fontSize="small" />
				</button>
			)}

			<div className="fixora-map-profile__hero">
				<img
					className="fixora-map-profile__avatar"
					src={avatarSrc || DEFAULT_AVATAR}
					alt=""
					onError={(e) => {
						e.currentTarget.src = DEFAULT_AVATAR;
					}}
				/>
				<div className="fixora-map-profile__titles">
					<h2 className="fixora-map-profile__name">{headline}</h2>
					{shopName && personName && <p className="fixora-map-profile__shop">{shopName}</p>}
					<div className="fixora-map-profile__rating">
						<StarIcon fontSize="inherit" />
						<span>{rating > 0 ? rating.toFixed(1) : t('search.map.noRating')}</span>
						<span className="fixora-map-profile__reviews">
							({t('search.map.reviewCount', { count: reviewCount })})
						</span>
					</div>
				</div>
			</div>

			{(address || displayDistanceKm != null) && (
				<div className="fixora-map-profile__meta">
					{displayDistanceKm != null && (
						<p className="fixora-map-profile__distance">
							{t('search.map.distanceAway', { distance: formatDistanceKm(displayDistanceKm) })}
						</p>
					)}
					{address && (
						<p className="fixora-map-profile__address">
							<LocationOnOutlinedIcon fontSize="inherit" />
							<span>{address}</span>
						</p>
					)}
				</div>
			)}

			{bio && <p className="fixora-map-profile__bio">{bio}</p>}

			{routeError && (
				<p className="fixora-map-profile__route-error" role="alert">
					{routeError}
				</p>
			)}

			{routeActive && routeInfo && (
				<div className="fixora-map-profile__route-stats">
					<p>
						<strong>{t('search.map.routeDistance')}</strong>
						<span>{formatDistanceKm(routeInfo.distanceKm)}</span>
					</p>
					<p>
						<strong>{t('search.map.routeDriving')}</strong>
						<span>{formatTravelMinutes(routeInfo.drivingMinutes)}</span>
					</p>
					<p>
						<strong>{t('search.map.routeWalking')}</strong>
						<span>{formatTravelMinutes(routeInfo.walkingMinutes)}</span>
					</p>
					<p>
						<strong>{t('search.map.routeTaxi')}</strong>
						<span>
							{formatTravelMinutes(routeInfo.taxiMinutes)}
							{formatTaxiFareKrw(routeInfo.taxiFareKrw)
								? ` · ${formatTaxiFareKrw(routeInfo.taxiFareKrw)}`
								: ''}
						</span>
					</p>
				</div>
			)}

			<div className="fixora-map-profile__actions">
				{onShowRoute && (
					<FixoraButton
						variant="outline"
						size="small"
						className="fixora-map-profile__route-btn"
						onClick={onShowRoute}
						disabled={routeLoading}
					>
						<DirectionsIcon fontSize="small" />
						{routeLoading ? t('search.map.routeLoading') : t('search.map.showRoute')}
					</FixoraButton>
				)}
				{hasShopCoords && (
					<FixoraButton
						variant="outline"
						size="small"
						className="fixora-map-profile__route-btn"
						onClick={navigateHandler}
					>
						<NavigationIcon fontSize="small" />
						{t('search.map.goNavigate')}
					</FixoraButton>
				)}
				{routeActive && onClearRoute && (
					<FixoraButton variant="ghost" size="small" onClick={onClearRoute}>
						{t('search.map.clearRoute')}
					</FixoraButton>
				)}
				<FixoraButton variant="primary" size="small" fullWidth onClick={viewProfileHandler}>
					{t('search.map.viewProfile')}
				</FixoraButton>
			</div>
		</article>
	);
};

export default TechnicianMapProfilePanel;
