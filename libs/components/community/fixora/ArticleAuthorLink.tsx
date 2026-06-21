import React from 'react';
import Link from 'next/link';
import VerifiedRounded from '@mui/icons-material/VerifiedRounded';
import { resolveProfileImageUrl } from '../../../utils/profileImage';
import { initialsOf } from '../../../utils/technicianProfileDisplay';

export interface ArticleAuthorLinkProps {
	authorId?: string;
	name: string;
	avatarUrl?: string | null;
	showVerified?: boolean;
	className?: string;
	avatarClassName?: string;
	nameClassName?: string;
}

const ArticleAuthorLink: React.FC<ArticleAuthorLinkProps> = ({
	authorId,
	name,
	avatarUrl,
	showVerified = false,
	className = 'fixora-community__author-link',
	avatarClassName = 'fixora-community__author-link__avatar',
	nameClassName = 'fixora-community__author-link__name',
}) => {
	const resolved = resolveProfileImageUrl(avatarUrl);
	const hasAvatar = resolved !== '/img/profile/defaultUser.svg';

	const content = (
		<>
			<span className={avatarClassName}>
				{hasAvatar ? <img src={resolved} alt={name} /> : initialsOf(name)}
			</span>
			<span className={nameClassName}>{name}</span>
			{showVerified && <VerifiedRounded className="fixora-community__author-link__verified" />}
		</>
	);

	if (!authorId) {
		return <div className={className}>{content}</div>;
	}

	return (
		<Link
			href={`/technicians/${authorId}`}
			className={className}
			onClick={(e) => e.stopPropagation()}
		>
			{content}
		</Link>
	);
};

export default ArticleAuthorLink;
