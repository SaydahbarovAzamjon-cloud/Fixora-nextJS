import React from 'react';

interface SettingsFieldProps {
	label: string;
	children: React.ReactNode;
	className?: string;
}

const SettingsField: React.FC<SettingsFieldProps> = ({ label, children, className = '' }) => (
	<div className={`fts-field ${className}`.trim()}>
		<label className="fts-field__label">{label}</label>
		{children}
	</div>
);

export default SettingsField;
