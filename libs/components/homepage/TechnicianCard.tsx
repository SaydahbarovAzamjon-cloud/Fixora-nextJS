import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StarIcon from '@mui/icons-material/Star';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { TechnicianSummary } from '../../types/fixora/fixora';
import { resolveProfileImageUrl } from '../../utils/profileImage';
import {
	getTechnicianDisplayName,
	getTechnicianOwnerSubtitleLabel,
} from '../../utils/technicianProfileDisplay';

interface TechnicianCardProps {
	technician: TechnicianSummary;
}

const DEFAULT_AVATAR = '/img/profile/defaultUser.svg';

const BADGE_KEY: Record<string, string> = {
	NEW: 'homepage.badge.new',
	VERIFIED: 'homepage.badge.verified',
	PREMIUM_PRO: 'homepage.badge.topPro',
};

const TechnicianCard = ({ technician }: TechnicianCardProps) => {
	const { t } = useTranslation('common');

	const displayName = getTechnicianDisplayName(technician);
	const ownerLabel = getTechnicianOwnerSubtitleLabel(technician);
	const badgeKey = BADGE_KEY[technician.badgeLevel ?? ''] ?? null;
	const avatarSrc = resolveProfileImageUrl(technician.userProfileImage);
	const locationLabel = technician.userLocation?.trim() || t('homepage.technicians.locationUnknown');
	const followersCount = technician.followersCount ?? 0;

	return (
		<Link href={`/technicians/${technician._id}`} className="fixora-tech-card">
			<div className="fixora-tech-card__top">
				<img
					className="fixora-tech-card__avatar"
					src={avatarSrc}
					alt=""
					onError={(e) => {
						if (!e.currentTarget.src.endsWith('defaultUser.svg')) {
							e.currentTarget.src = DEFAULT_AVATAR;
						}
					}}
				/>
				<div className="fixora-tech-card__identity">
					<span
						className={`fixora-tech-card__status ${
							technician.isOnline ? 'fixora-tech-card__status--online' : 'fixora-tech-card__status--offline'
						}`}
					>
						{technician.isOnline ? t('homepage.technicians.online') : t('homepage.technicians.offline')}
					</span>
					<strong className="fixora-tech-card__name">{displayName}</strong>
					<span className={`fixora-tech-card__owner${ownerLabel ? '' : ' fixora-tech-card__owner--empty'}`}>
						{ownerLabel ?? '\u00A0'}
					</span>
					<span className="fixora-tech-card__rating">
						<StarIcon fontSize="inherit" />
						{technician.averageRating?.toFixed(1) ?? '—'}
						<em>({technician.reviewCount ?? 0})</em>
					</span>
				</div>
			</div>

			<p className="fixora-tech-card__specialty">
				{technician.specialty?.trim() || t('homepage.technicians.defaultSpecialty')}
			</p>

			<div className="fixora-tech-card__meta">
				<span
					className={`fixora-tech-card__meta-row fixora-tech-card__meta-row--location${
						technician.userLocation?.trim() ? '' : ' fixora-tech-card__meta-row--muted'
					}`}
				>
					<LocationOnOutlinedIcon fontSize="inherit" />
					{locationLabel}
				</span>
				<span className="fixora-tech-card__meta-row">
					{t('homepage.technicians.jobsCompleted', { total: technician.completedJobsCount ?? 0 })}
				</span>
				{followersCount > 0 && (
					<span className="fixora-tech-card__meta-row">
						<GroupOutlinedIcon fontSize="inherit" />
						{t('homepage.technicians.followers', { count: followersCount })}
					</span>
				)}
			</div>

			{badgeKey && <span className="fixora-tech-card__badge">{t(badgeKey)}</span>}
		</Link>
	);
};

export default TechnicianCard;
