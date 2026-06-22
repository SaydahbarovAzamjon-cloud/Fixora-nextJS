import React from 'react';

export type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'purple' | 'blue' | 'yellow';

interface AdminStatusBadgeProps {
	label: string;
	tone?: BadgeTone;
	className?: string;
}

const AdminStatusBadge: React.FC<AdminStatusBadgeProps> = ({ label, tone = 'neutral', className = '' }) => (
	<span className={`fixora-admin-badge fixora-admin-badge--${tone} ${className}`.trim()}>{label}</span>
);

export default AdminStatusBadge;
