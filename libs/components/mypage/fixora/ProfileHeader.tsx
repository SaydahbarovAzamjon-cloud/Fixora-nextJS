import React from 'react';
import { useTranslation } from 'next-i18next';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import { resolveProfileImageUrl } from '../../../utils/profileImage';
import { formatKrw } from '../../../utils/formatCurrency';

export interface ProfileHeaderProps {
	name: string;
	image?: string;
	readOnly?: boolean;
	memberSince?: string;
	location?: string;
	repairsCount?: number;
	reviewsCount?: number;
	followingCount?: number;
	savedCount?: number;
	avgRatingGiven?: number | null;
	totalSpent?: number;
	onEditProfile?: () => void;
	/** Legacy public profile stats layout */
	stats?: { label: string; value: React.ReactNode }[];
	/** Legacy fields — ignored in owner layout */
	email?: string;
	requestsCount?: number;
	storiesCount?: number;
}

const ProfileHeader = ({
	name,
	image,
	readOnly = false,
	memberSince,
	location,
	repairsCount = 0,
	reviewsCount = 0,
	followingCount = 0,
	savedCount = 0,
	avgRatingGiven,
	totalSpent = 0,
	onEditProfile,
	stats,
}: ProfileHeaderProps) => {
	const { t } = useTranslation('common');
	const isOwnerLayout = !stats;

	if (!isOwnerLayout && stats) {
		return (
			<div className="fixora-mypage__header fixora-mypage__header--public">
				<div className="fixora-mypage__identity">
					<img className="fixora-mypage__avatar" src={resolveProfileImageUrl(image)} alt="" />
					<div className="fixora-mypage__identity-info">
						<strong className="fixora-mypage__name">{name}</strong>
						{memberSince && <span className="fixora-mypage__email">{memberSince}</span>}
						{location && <span className="fixora-mypage__email">{location}</span>}
					</div>
				</div>
				<div className="fixora-mypage__stats">
					{stats.map((stat) => (
						<div className="fixora-mypage__stat" key={String(stat.label)}>
							<strong>{stat.value}</strong>
							<span>{stat.label}</span>
						</div>
					))}
				</div>
			</div>
		);
	}

	const metaParts = [memberSince, location].filter(Boolean);

	return (
		<div className="fixora-mypage__header fixora-mypage__header--owner">
			<div className="fixora-mypage__header-main">
				<div className="fixora-mypage__identity fixora-mypage__identity--owner">
					<div className="fixora-mypage__avatar-wrap">
						<img className="fixora-mypage__avatar-square" src={resolveProfileImageUrl(image)} alt="" />
						{!readOnly && (
							<button type="button" className="fixora-mypage__avatar-camera" aria-label={t('mypage.changePhoto')}>
								<PhotoCameraOutlinedIcon fontSize="inherit" />
							</button>
						)}
					</div>
					<div className="fixora-mypage__identity-info">
						<div className="fixora-mypage__name-row">
							<strong className="fixora-mypage__name">{name}</strong>
							{!readOnly && onEditProfile && (
								<button type="button" className="fixora-mypage__edit-inline" onClick={onEditProfile}>
									<EditOutlinedIcon fontSize="inherit" />
									{t('mypage.editProfile')}
								</button>
							)}
						</div>
						{metaParts.length > 0 && (
							<span className="fixora-mypage__meta">{metaParts.join(' · ')}</span>
						)}
						<div className="fixora-mypage__inline-stats">
							<div>
								<strong>{repairsCount}</strong>
								<span>{t('mypage.stats.repairs')}</span>
							</div>
							<div>
								<strong>{reviewsCount}</strong>
								<span>{t('mypage.stats.reviews')}</span>
							</div>
							<div>
								<strong>{followingCount}</strong>
								<span>{t('mypage.stats.following')}</span>
							</div>
							<div>
								<strong>{savedCount}</strong>
								<span>{t('mypage.stats.saved')}</span>
							</div>
						</div>
					</div>
				</div>

				<div className="fixora-mypage__summary-cards">
					<div className="fixora-mypage__summary-card fixora-mypage__summary-card--rating">
						<strong>{avgRatingGiven != null ? avgRatingGiven.toFixed(1) : '—'}</strong>
						<span>{t('mypage.summary.avgRating')}</span>
					</div>
					<div className="fixora-mypage__summary-card fixora-mypage__summary-card--spent">
						<strong>{formatKrw(totalSpent)}</strong>
						<span>{t('mypage.summary.totalSpent')}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfileHeader;
