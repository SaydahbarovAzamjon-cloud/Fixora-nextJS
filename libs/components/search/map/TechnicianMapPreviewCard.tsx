import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import StarIcon from '@mui/icons-material/Star';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CloseIcon from '@mui/icons-material/Close';
import FixoraButton from '../../ui/FixoraButton';
import { TechnicianSummary } from '../../../types/fixora/fixora';
import { resolveProfileImageUrl } from '../../../utils/profileImage';
import { formatDistanceKm } from '../../../utils/technicianMap';

const DEFAULT_AVATAR = '/img/profile/defaultUser.svg';

export interface TechnicianMapPreviewCardProps {
	technician: TechnicianSummary;
	distanceKm?: number | null;
	onClose?: () => void;
	className?: string;
}

const TechnicianMapPreviewCard = ({
	technician,
	distanceKm,
	onClose,
	className = '',
}: TechnicianMapPreviewCardProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();

	const personName = technician.userNickname || technician.userFullName || '';
	const shopName = technician.shopName?.trim() || '';
	const headline = personName || shopName || t('search.map.unknownTechnician');
	const rating = technician.averageRating ?? 0;
	const reviewCount = technician.reviewCount ?? 0;
	const address = technician.userLocation?.trim();
	const avatarSrc = resolveProfileImageUrl(technician.userProfileImage);

	const viewProfileHandler = () => {
		void router.push(`/technicians/${technician._id}`);
	};

	return (
		<article className={`fixora-map-preview${className ? ` ${className}` : ''}`}>
			{onClose && (
				<button
					type="button"
					className="fixora-map-preview__close"
					onClick={onClose}
					aria-label={t('search.map.closePreview')}
				>
					<CloseIcon fontSize="small" />
				</button>
			)}

			<div className="fixora-map-preview__header">
				<img
					className="fixora-map-preview__avatar"
					src={avatarSrc || DEFAULT_AVATAR}
					alt=""
					onError={(e) => {
						e.currentTarget.src = DEFAULT_AVATAR;
					}}
				/>
				<div className="fixora-map-preview__titles">
					<h3 className="fixora-map-preview__name">{headline}</h3>
					{shopName && personName && (
						<p className="fixora-map-preview__shop">{shopName}</p>
					)}
					<div className="fixora-map-preview__rating">
						<StarIcon fontSize="inherit" />
						<span>{rating > 0 ? rating.toFixed(1) : t('search.map.noRating')}</span>
						<span className="fixora-map-preview__reviews">
							({t('search.map.reviewCount', { count: reviewCount })})
						</span>
					</div>
				</div>
			</div>

			{(address || distanceKm != null) && (
				<div className="fixora-map-preview__meta">
					{address && (
						<p className="fixora-map-preview__address">
							<LocationOnOutlinedIcon fontSize="inherit" />
							<span>{address}</span>
						</p>
					)}
					{distanceKm != null && (
						<p className="fixora-map-preview__distance">
							{t('search.map.distanceAway', { distance: formatDistanceKm(distanceKm) })}
						</p>
					)}
				</div>
			)}

			<FixoraButton
				variant="primary"
				size="small"
				fullWidth
				className="fixora-map-preview__cta"
				onClick={viewProfileHandler}
			>
				{t('search.map.viewProfile')}
			</FixoraButton>
		</article>
	);
};

export default TechnicianMapPreviewCard;
