import React, { ButtonHTMLAttributes } from 'react';

export type FixoraButtonVariant = 'primary' | 'outline' | 'ghost';

export interface FixoraButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: FixoraButtonVariant;
	fullWidth?: boolean;
}

const FixoraButton = ({
	variant = 'primary',
	fullWidth = false,
	className = '',
	children,
	type = 'button',
	...rest
}: FixoraButtonProps) => {
	const classes = [
		'fixora-btn',
		`fixora-btn--${variant}`,
		fullWidth ? 'fixora-btn--full' : '',
		className,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<button type={type} className={classes} {...rest}>
			{children}
		</button>
	);
};

export default FixoraButton;
