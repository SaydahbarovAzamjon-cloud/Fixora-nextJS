import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../../../apollo/user/query';
import { resolveProfileImageUrl } from '../../utils/profileImage';
import UserProfileLink from '../common/UserProfileLink';

const initialsOf = (name: string) => {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return 'U';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[1][0]).toUpperCase();
};

interface NotificationSenderProps {
	userId?: string | null;
	className?: string;
}

/** Avatar + nickname for notification cards; links to user profile on click. */
const NotificationSender = ({ userId, className = '' }: NotificationSenderProps) => {
	const { data } = useQuery(GET_USER, {
		skip: !userId,
		variables: { userId },
		fetchPolicy: 'cache-first',
	});
	const sender = data?.getUser;
	if (!userId || !sender) return null;

	const name = sender.userNickname || sender.userFullName || sender.shopName || 'User';
	const img = sender.userProfileImage;
	const rowClass = ['fixora-notif-card__sender-row', className].filter(Boolean).join(' ');

	return (
		<UserProfileLink userId={userId} userType={sender.userType} className={rowClass}>
			<span className="fixora-notif-card__avatar">
				{img && img.trim() !== '' ? <img src={resolveProfileImageUrl(img)} alt={name} /> : initialsOf(name)}
			</span>
			<span className="fixora-notif-card__sender">{name}</span>
		</UserProfileLink>
	);
};

export default NotificationSender;
