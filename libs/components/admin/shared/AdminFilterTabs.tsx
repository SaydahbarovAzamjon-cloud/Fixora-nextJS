import React from 'react';

interface Tab {
	id: string;
	label: string;
	badge?: number;
}

interface AdminFilterTabsProps {
	tabs: Tab[];
	activeId: string;
	onChange: (id: string) => void;
	className?: string;
}

const AdminFilterTabs: React.FC<AdminFilterTabsProps> = ({ tabs, activeId, onChange, className = '' }) => (
	<div className={`fixora-admin-filter-tabs ${className}`.trim()}>
		{tabs.map((tab) => (
			<button
				key={tab.id}
				type="button"
				className={`fixora-admin-filter-tabs__tab${activeId === tab.id ? ' fixora-admin-filter-tabs__tab--active' : ''}`}
				onClick={() => onChange(tab.id)}
			>
				{tab.label}
				{tab.badge != null && tab.badge > 0 && (
					<span className="fixora-admin-filter-tabs__badge">{tab.badge}</span>
				)}
			</button>
		))}
	</div>
);

export default AdminFilterTabs;
