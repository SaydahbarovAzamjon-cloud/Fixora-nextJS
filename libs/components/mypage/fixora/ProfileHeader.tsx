import React from 'react';
import { useTranslation } from 'next-i18next';
import { resolveProfileImageUrl } from '../../../utils/profileImage';
import { FixoraButton } from '../../ui';

export interface ProfileHeaderProps {
	name: string;
	email?: string;
	image?: string;
	requestsCount: number;
	followingCount: number;
	storiesCount: number;
	onEditProfile?: () => void;
	readOnly?: boolean;
	memberSince?: string;
	location?: string;
	stats?: { label: string; value: React.ReactNode }[];
}

const ProfileHeader = ({
	name,
	email,
	image,
	requestsCount,
	followingCount,
	storiesCount,
	onEditProfile,
	readOnly = false,
	memberSince,
	location,
	stats,
}: ProfileHeaderProps) => {
	const { t } = useTranslation('common');
	const displayStats = stats ?? [
		{ value: requestsCount, label: t('mypage.requests') },
		{ value: followingCount, label: t('mypage.following') },
		{ value: storiesCount, label: t('mypage.stories') },
	];

	return (
		<div className="fixora-mypage__header">
			<div className="fixora-mypage__identity">
				<img className="fixora-mypage__avatar" src={resolveProfileImageUrl(image)} alt="" />
				<div className="fixora-mypage__identity-info">
					<strong className="fixora-mypage__name">{name}</strong>
					{email && <span className="fixora-mypage__email">{email}</span>}
					{memberSince && <span className="fixora-mypage__email">{memberSince}</span>}
					{location && <span className="fixora-mypage__email">{location}</span>}
					{!readOnly && onEditProfile && (
						<FixoraButton variant="outline" className="fixora-mypage__edit-btn" onClick={onEditProfile}>
							{t('mypage.editProfile')}
						</FixoraButton>
					)}
				</div>
			</div>

			<div className="fixora-mypage__stats">
				{displayStats.map((stat) => (
					<div className="fixora-mypage__stat" key={String(stat.label)}>
						<strong>{stat.value}</strong>
						<span>{stat.label}</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default ProfileHeader;
