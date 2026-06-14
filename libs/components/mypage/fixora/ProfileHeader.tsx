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
	onEditProfile: () => void;
}

const ProfileHeader = ({ name, email, image, requestsCount, followingCount, storiesCount, onEditProfile }: ProfileHeaderProps) => {
	const { t } = useTranslation('common');

	return (
		<div className="fixora-mypage__header">
			<div className="fixora-mypage__identity">
				<img className="fixora-mypage__avatar" src={resolveProfileImageUrl(image)} alt="" />
				<div className="fixora-mypage__identity-info">
					<strong className="fixora-mypage__name">{name}</strong>
					{email && <span className="fixora-mypage__email">{email}</span>}
					<FixoraButton variant="outline" className="fixora-mypage__edit-btn" onClick={onEditProfile}>
						{t('mypage.editProfile')}
					</FixoraButton>
				</div>
			</div>

			<div className="fixora-mypage__stats">
				<div className="fixora-mypage__stat">
					<strong>{requestsCount}</strong>
					<span>{t('mypage.requests')}</span>
				</div>
				<div className="fixora-mypage__stat">
					<strong>{followingCount}</strong>
					<span>{t('mypage.following')}</span>
				</div>
				<div className="fixora-mypage__stat">
					<strong>{storiesCount}</strong>
					<span>{t('mypage.stories')}</span>
				</div>
			</div>
		</div>
	);
};

export default ProfileHeader;
