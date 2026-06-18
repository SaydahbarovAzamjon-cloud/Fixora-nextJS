import React from 'react';

interface WriteArticleToggleProps {
	on: boolean;
	onChange: () => void;
	ariaLabel: string;
}

const WriteArticleToggle: React.FC<WriteArticleToggleProps> = ({ on, onChange, ariaLabel }) => (
	<button
		type="button"
		className={`ftwa-toggle ${on ? 'ftwa-toggle--on' : ''}`}
		onClick={onChange}
		aria-label={ariaLabel}
		aria-pressed={on}
	>
		<span className="ftwa-toggle__knob" />
	</button>
);

export default WriteArticleToggle;
