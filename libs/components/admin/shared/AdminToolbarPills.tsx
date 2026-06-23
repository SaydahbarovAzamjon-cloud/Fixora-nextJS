import React from 'react';

export type AdminToolbarPillOption = {
	id: string;
	label: string;
	disabled?: boolean;
	tooltip?: string;
};

interface AdminToolbarPillsProps {
	options: AdminToolbarPillOption[];
	activeId: string;
	onChange: (id: string) => void;
	allowDeselect?: boolean;
	className?: string;
}

const AdminToolbarPills: React.FC<AdminToolbarPillsProps> = ({
	options,
	activeId,
	onChange,
	allowDeselect = true,
	className = '',
}) => (
	<div className={`fixora-admin-toolbar-pills ${className}`.trim()} role="group">
		{options.map((option) => {
			const isActive = activeId === option.id;
			return (
				<button
					key={option.id}
					type="button"
					className={`fixora-admin-toolbar-pills__pill${
						isActive ? ' fixora-admin-toolbar-pills__pill--active' : ''
					}${option.disabled ? ' fixora-admin-toolbar-pills__pill--disabled' : ''}`}
					onClick={() => {
						if (option.disabled) return;
						if (allowDeselect && isActive) onChange('');
						else onChange(option.id);
					}}
					disabled={option.disabled}
					title={option.tooltip}
					aria-pressed={isActive}
				>
					{option.label}
					{option.disabled && option.tooltip && (
						<span className="fixora-admin-toolbar-pills__hint">{option.tooltip}</span>
					)}
				</button>
			);
		})}
	</div>
);

export default AdminToolbarPills;
