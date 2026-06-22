import React, { MouseEvent } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StarIcon from '@mui/icons-material/Star';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { TechnicianSummary } from '../../types/fixora/fixora';
import { userVar } from '../../../apollo/store';
import { formatKrwNumber } from '../../utils/formatCurrency';
import { FAST_RESPONDER_MAX_MINUTES } from '../../utils/technicianDiscoverySections';
import {
	getTechnicianDisplayName,
	getTechnicianOwnerSubtitle,
} from '../../utils/technicianProfileDisplay';
import { resolveProfileImageUrl } from '../../utils/profileImage';

interface TechnicianResultCardProps {
	technician: TechnicianSummary;
	view: 'grid' | 'list';
	favorited: boolean;
	following: boolean;
	onToggleFavorite: (id: string) => void;
	onToggleFollow: (id: string, isFollowing: boolean) => void;
}

const BADGE_TAGS = ['topRated', 'greatReviews', 'fastResponder', 'affordable'] as const;

const DEFAULT_AVATAR = '/img/profile/defaultUser.svg';

const getBadgeTag = (technician: TechnicianSummary): (typeof BADGE_TAGS)[number] => {
	if ((technician.averageRating ?? 0) >= 4.8) return 'topRated';
	if ((technician.reviewCount ?? 0) >= 50) return 'greatReviews';
	if (technician.avgResponseMinutes != null && technician.avgResponseMinutes <= FAST_RESPONDER_MAX_MINUTES) {
		return 'fastResponder';
	}
	return (technician.completedJobsCount ?? 0) % 2 === 0 ? 'fastResponder' : 'affordable';
};

const getDistance = (id: string): number => {
	let hash = 0;
	for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 1000;
	return (hash % 28) + 2;
};

const TechnicianResultCard = ({ technician, view, favorited, following, onToggleFavorite, onToggleFollow }: TechnicianResultCardProps) => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const displayName = getTechnicianDisplayName(technician);
	const ownerSubtitle = getTechnicianOwnerSubtitle(technician);
	const fromPrice = technician.services?.length
		? Math.min(...technician.services.map((service) => service.basePrice))
		: null;
	const serviceNames = technician.services?.length
		? technician.services.map((service) => service.title).join(', ')
		: technician.specialty;
	const badgeTag = getBadgeTag(technician);
	const distance = getDistance(technician._id);
	const responseLabel =
		technician.avgResponseMinutes != null
			? t('search.results.responseTimeMinutes', { minutes: Math.round(technician.avgResponseMinutes) })
			: t('search.results.responseTime');
	const isSelf = !!user?._id && user._id === technician._id;
	const avatarSrc = resolveProfileImageUrl(technician.userProfileImage);

	const favoriteClickHandler = (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onToggleFavorite(technician._id);
	};

	const followClickHandler = (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onToggleFollow(technician._id, following);
	};

	return (
		<Link href={`/technicians/${technician._id}`} className={`fixora-result-card fixora-result-card--${view}`}>
			<div className="fixora-result-card__actions">
				<button type="button" className="fixora-result-card__favorite" onClick={favoriteClickHandler} aria-label="favorite">
					{favorited ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
				</button>

				{!isSelf && (
					<button
						type="button"
						className={`fixora-result-card__follow${following ? ' fixora-result-card__follow--active' : ''}`}
						onClick={followClickHandler}
						aria-label="follow"
					>
						{following ? <HowToRegIcon fontSize="inherit" /> : <PersonAddAlt1Icon fontSize="inherit" />}
						<span>{following ? t('search.results.following') : t('search.results.follow')}</span>
					</button>
				)}
			</div>

			<div className="fixora-result-card__body">
				<div className="fixora-result-card__avatar-wrap">
					<img
						className="fixora-result-card__avatar"
						src={avatarSrc}
						alt=""
						onError={(e) => {
							if (!e.currentTarget.src.endsWith('defaultUser.svg')) {
								e.currentTarget.src = DEFAULT_AVATAR;
							}
						}}
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

					{ownerSubtitle && <span className="fixora-result-card__owner">{ownerSubtitle}</span>}

					<span className="fixora-result-card__rating">
						<StarIcon fontSize="inherit" />
						{technician.averageRating?.toFixed(1) ?? '—'}
						<em>({technician.reviewCount ?? 0})</em>
					</span>

					<span className={`fixora-result-card__badge fixora-result-card__badge--${badgeTag}`}>
						{t(`search.results.badge.${badgeTag}`)}
					</span>

					{serviceNames && <span className="fixora-result-card__specialty">{serviceNames}</span>}

					<span className="fixora-result-card__jobs">
						<WorkOutlineIcon fontSize="inherit" />
						{t('search.results.jobsCompleted', { total: technician.completedJobsCount ?? 0 })}
					</span>

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
						<span className="fixora-result-card__price">
							{t('search.results.fromPrice', { price: formatKrwNumber(fromPrice) })}
						</span>
					)}
					<span className="fixora-result-card__response">{responseLabel}</span>
				</div>
			)}
		</Link>
	);
};

export default TechnicianResultCard;
