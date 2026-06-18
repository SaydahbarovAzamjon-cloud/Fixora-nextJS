import React from 'react';

interface SettingsToggleProps {
	on: boolean;
	onChange: () => void;
	disabled?: boolean;
	ariaLabel: string;
}

const SettingsToggle: React.FC<SettingsToggleProps> = ({ on, onChange, disabled = false, ariaLabel }) => (
	<button
		type="button"
		className={`fts-toggle ${on ? 'fts-toggle--on' : ''}`}
		onClick={onChange}
		disabled={disabled}
		aria-label={ariaLabel}
		aria-pressed={on}
	>
		<span className="fts-toggle__knob" />
	</button>
);

export default SettingsToggle;
