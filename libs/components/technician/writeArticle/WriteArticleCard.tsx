import React from 'react';

interface WriteArticleCardProps {
	children: React.ReactNode;
	className?: string;
	padding?: boolean;
}

const WriteArticleCard: React.FC<WriteArticleCardProps> = ({
	children,
	className = '',
	padding = true,
}) => (
	<div className={`ftwa-card ${padding ? 'ftwa-card--padded' : ''} ${className}`.trim()}>
		{children}
	</div>
);

interface WriteArticleCardHeadProps {
	title: string;
	icon?: React.ReactNode;
	iconClass?: string;
}

export const WriteArticleCardHead: React.FC<WriteArticleCardHeadProps> = ({
	title,
	icon,
	iconClass = 'ftwa-card-head__icon--orange',
}) => (
	<div className="ftwa-card-head">
		{icon && <span className={`ftwa-card-head__icon ${iconClass}`}>{icon}</span>}
		<span className="ftwa-card-head__title">{title}</span>
	</div>
);

export default WriteArticleCard;
