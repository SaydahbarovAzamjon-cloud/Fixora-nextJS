import React from 'react';
import { useTranslation } from 'next-i18next';
import StarIcon from '@mui/icons-material/Star';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { TechnicianProfile } from '../../types/fixora/fixora';

interface TechnicianProfileHeroProps {
	technician: TechnicianProfile;
	isOwnProfile?: boolean;
	onToggleFollow?: () => void;
	onChat?: () => void;
}

const TechnicianProfileHero = ({ technician, isOwnProfile, onToggleFollow, onChat }: TechnicianProfileHeroProps) => {
	const { t } = useTranslation('common');
	const displayName = technician.shopName || technician.userNickname || technician.userFullName;
	const isFollowing = !!technician.meFollowed?.[0]?.myFollowing;

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
						<span>
							<GroupOutlinedIcon fontSize="inherit" />
							{t('technicianProfile.followers', { count: technician.followersCount ?? 0 })}
						</span>
					</div>
				</div>

				{!isOwnProfile && (
					<div className="fixora-tech-profile__hero-actions">
						<button
							type="button"
							className={`fixora-tech-profile__follow-btn${
								isFollowing ? ' fixora-tech-profile__follow-btn--active' : ''
							}`}
							onClick={onToggleFollow}
						>
							{isFollowing ? <HowToRegIcon fontSize="small" /> : <PersonAddAlt1Icon fontSize="small" />}
							{isFollowing ? t('technicianProfile.following') : t('technicianProfile.follow')}
						</button>
						<button type="button" className="fixora-tech-profile__chat-btn" onClick={onChat}>
							<ChatBubbleOutlineRoundedIcon fontSize="small" />
							{t('technicianProfile.chat.cta')}
						</button>
					</div>
				)}
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
