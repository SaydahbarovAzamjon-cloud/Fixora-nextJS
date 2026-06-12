import React, { MouseEvent } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StarIcon from '@mui/icons-material/Star';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { TechnicianSummary } from '../../types/fixora/fixora';

interface TechnicianResultCardProps {
	technician: TechnicianSummary;
	view: 'grid' | 'list';
	favorited: boolean;
	onToggleFavorite: (id: string) => void;
}

const BADGE_TAGS = ['topRated', 'greatReviews', 'fastResponder', 'affordable'] as const;

const getBadgeTag = (technician: TechnicianSummary): (typeof BADGE_TAGS)[number] => {
	if ((technician.averageRating ?? 0) >= 4.8) return 'topRated';
	if ((technician.reviewCount ?? 0) >= 50) return 'greatReviews';
	return (technician.completedJobsCount ?? 0) % 2 === 0 ? 'fastResponder' : 'affordable';
};

const getDistance = (id: string): number => {
	let hash = 0;
	for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 1000;
	return (hash % 28) + 2;
};

const TechnicianResultCard = ({ technician, view, favorited, onToggleFavorite }: TechnicianResultCardProps) => {
	const { t } = useTranslation('common');
	const displayName = technician.shopName || technician.userNickname || technician.userFullName;
	const fromPrice = technician.services?.length
		? Math.min(...technician.services.map((service) => service.basePrice))
		: null;
	const serviceNames = technician.services?.length
		? technician.services.map((service) => service.title).join(', ')
		: technician.specialty;
	const badgeTag = getBadgeTag(technician);
	const distance = getDistance(technician._id);

	const favoriteClickHandler = (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onToggleFavorite(technician._id);
	};

	return (
		<Link href={`/technicians/${technician._id}`} className={`fixora-result-card fixora-result-card--${view}`}>
			<button type="button" className="fixora-result-card__favorite" onClick={favoriteClickHandler} aria-label="favorite">
				{favorited ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
			</button>

			<div className="fixora-result-card__body">
				<div className="fixora-result-card__avatar-wrap">
					<img
						className="fixora-result-card__avatar"
						src={technician.userProfileImage || '/img/profile/defaultUser.svg'}
						alt=""
					/>
					<span
						className={`fixora-result-card__status-dot${
							technician.isOnline ? ' fixora-result-card__status-dot--online' : ''
						}`}
					/>
				</div>

				<div className="fixora-result-card__main">
					<div className="fixora-result-card__name-row">
						<strong className="fixora-result-card__name">{displayName}</strong>
						{technician.badgeLevel === 'VERIFIED' && (
							<VerifiedOutlinedIcon className="fixora-result-card__verified" fontSize="inherit" />
						)}
					</div>

					<span className="fixora-result-card__rating">
						<StarIcon fontSize="inherit" />
						{technician.averageRating?.toFixed(1) ?? '—'}
						<em>({technician.reviewCount ?? 0})</em>
					</span>

					<span className={`fixora-result-card__badge fixora-result-card__badge--${badgeTag}`}>
						{t(`search.results.badge.${badgeTag}`)}
					</span>

					{serviceNames && <span className="fixora-result-card__specialty">{serviceNames}</span>}

					{view === 'list' && (
						<span className="fixora-result-card__jobs">
							{t('search.results.jobsCompleted', { total: technician.completedJobsCount ?? 0 })}
						</span>
					)}

					{technician.userLocation && (
						<span className="fixora-result-card__location">
							<LocationOnOutlinedIcon fontSize="inherit" />
							{technician.userLocation}
							<em>
								<AccessTimeOutlinedIcon fontSize="inherit" />
								{t('search.results.minAway', { count: distance })}
							</em>
						</span>
					)}
				</div>
			</div>

			{view === 'list' && (
				<div className="fixora-result-card__aside">
					{fromPrice !== null && (
						<span className="fixora-result-card__price">{t('search.results.fromPrice', { price: fromPrice })}</span>
					)}
					<span className="fixora-result-card__response">{t('search.results.responseTime')}</span>
				</div>
			)}
		</Link>
	);
};

export default TechnicianResultCard;
