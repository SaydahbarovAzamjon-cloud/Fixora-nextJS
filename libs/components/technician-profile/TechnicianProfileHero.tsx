import React from 'react';
import { useTranslation } from 'next-i18next';
import StarIcon from '@mui/icons-material/Star';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { TechnicianProfile } from '../../types/fixora/fixora';

interface TechnicianProfileHeroProps {
	technician: TechnicianProfile;
}

const TechnicianProfileHero = ({ technician }: TechnicianProfileHeroProps) => {
	const { t } = useTranslation('common');
	const displayName = technician.shopName || technician.userNickname || technician.userFullName;

	return (
		<section className="fixora-tech-profile__hero">
			<div className="fixora-tech-profile__hero-main">
				<div className="fixora-tech-profile__avatar-wrap">
					<img
						src={technician.userProfileImage || '/img/profile/defaultUser.svg'}
						alt=""
						className="fixora-tech-profile__avatar"
					/>
					<span
						className={`fixora-tech-profile__status${
							technician.isOnline ? ' fixora-tech-profile__status--online' : ''
						}`}
					>
						{technician.isOnline ? t('technicianProfile.online') : t('technicianProfile.offline')}
					</span>
				</div>

				<div className="fixora-tech-profile__hero-info">
					<div className="fixora-tech-profile__name-row">
						<h1>{displayName}</h1>
						{(technician.isVerified || technician.badgeLevel === 'VERIFIED') && (
							<span className="fixora-tech-profile__verified">
								<VerifiedOutlinedIcon fontSize="small" />
								{t('technicianProfile.verified')}
							</span>
						)}
					</div>

					{technician.specialty && <p className="fixora-tech-profile__specialty">{technician.specialty}</p>}

					<div className="fixora-tech-profile__meta">
						<span>
							<StarIcon fontSize="inherit" />
							{technician.averageRating?.toFixed(1) ?? '—'} ({technician.reviewCount ?? 0})
						</span>
						{technician.userLocation && (
							<span>
								<LocationOnOutlinedIcon fontSize="inherit" />
								{technician.userLocation}
							</span>
						)}
					</div>
				</div>
			</div>

			<div className="fixora-tech-profile__stats">
				<div>
					<strong>{technician.yearsExperience ?? 0}</strong>
					<span>{t('technicianProfile.stats.years')}</span>
				</div>
				<div>
					<strong>{technician.completedJobsCount ?? 0}</strong>
					<span>{t('technicianProfile.stats.jobs')}</span>
				</div>
				<div>
					<strong>{technician.averageRating?.toFixed(1) ?? '—'}</strong>
					<span>{t('technicianProfile.stats.rating')}</span>
				</div>
				<div>
					<strong>98%</strong>
					<span>{t('technicianProfile.stats.satisfaction')}</span>
				</div>
			</div>
		</section>
	);
};

export default TechnicianProfileHero;
