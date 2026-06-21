import React from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { getUserProfileHref } from '../../utils/userProfileRoute';

interface UserProfileLinkProps {
	userId?: string | null;
	userType?: string | null;
	className?: string;
	stopPropagation?: boolean;
	children: React.ReactNode;
}

const UserProfileLink = ({ userId, userType, className = '', stopPropagation = true, children }: UserProfileLinkProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const href = getUserProfileHref(userId, user?._id, userType, user?.userType ?? user?.memberType);

	if (!userId || !href) {
		return <>{children}</>;
	}

	const navigate = (e: React.MouseEvent | React.KeyboardEvent) => {
		if (stopPropagation) e.stopPropagation();
		e.preventDefault();
		router.push(href);
	};

	return (
		<span
			role="link"
			tabIndex={0}
			className={`fixora-profile-link ${className}`.trim()}
			onClick={navigate}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') navigate(e);
			}}
		>
			{children}
		</span>
	);
};

export default UserProfileLink;
