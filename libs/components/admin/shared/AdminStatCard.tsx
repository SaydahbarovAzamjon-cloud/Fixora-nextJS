import React from 'react';

interface AdminStatCardProps {
	icon: React.ReactNode;
	label: string;
	value: string | number;
	subtext?: string;
	iconTone?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({ icon, label, value, subtext, iconTone = 'primary' }) => (
	<div className="fixora-admin-stat-card">
		<div className="fixora-admin-stat-card__top">
			<div className={`fixora-admin-stat-card__icon fixora-admin-stat-card__icon--${iconTone}`}>{icon}</div>
		</div>
		<div className="fixora-admin-stat-card__value">{value}</div>
		<div className="fixora-admin-stat-card__label">{label}</div>
		{subtext && <div className="fixora-admin-stat-card__sub">{subtext}</div>}
	</div>
);

export default AdminStatCard;
