import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StarIcon from '@mui/icons-material/Star';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { TechnicianSummary } from '../../types/fixora/fixora';

interface TechnicianCardProps {
	technician: TechnicianSummary;
}

const BADGE_KEY: Record<string, string> = {
	NEW: 'homepage.badge.new',
	VERIFIED: 'homepage.badge.verified',
	PREMIUM_PRO: 'homepage.badge.topPro',
};

const TechnicianCard = ({ technician }: TechnicianCardProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();

	const displayName = technician.shopName || technician.userNickname || technician.userFullName;
	const ownerName = technician.userFullName || technician.userNickname;
	const showOwnerName = !!technician.shopName && !!ownerName && ownerName !== displayName;
	const badgeKey = BADGE_KEY[technician.badgeLevel ?? ''] ?? null;

	return (
		<button
			type="button"
			className="fixora-tech-card"
			onClick={() => router.push(`/agent/detail?id=${technician._id}`)}
		>
			<div className="fixora-tech-card__top">
				<img
					className="fixora-tech-card__avatar"
					src={technician.userProfileImage || '/img/profile/defaultUser.svg'}
					alt=""
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
					{showOwnerName && <span className="fixora-tech-card__owner">{ownerName}</span>}
					<span className="fixora-tech-card__rating">
						<StarIcon fontSize="inherit" />
						{technician.averageRating?.toFixed(1) ?? '—'}
						<em>({technician.reviewCount ?? 0})</em>
					</span>
				</div>
			</div>

			{technician.specialty && <p className="fixora-tech-card__specialty">{technician.specialty}</p>}

			<div className="fixora-tech-card__meta">
				{technician.userLocation && (
					<span className="fixora-tech-card__meta-row">
						<LocationOnOutlinedIcon fontSize="inherit" />
						{technician.userLocation}
					</span>
				)}
				<span className="fixora-tech-card__meta-row">
					{t('homepage.technicians.jobsCompleted', { total: technician.completedJobsCount ?? 0 })}
				</span>
				<span className="fixora-tech-card__meta-row">
					<GroupOutlinedIcon fontSize="inherit" />
					{t('homepage.technicians.followers', { count: technician.followersCount ?? 0 })}
				</span>
			</div>

			{badgeKey && <span className="fixora-tech-card__badge">{t(badgeKey)}</span>}
		</button>
	);
};

export default TechnicianCard;
