import React, { ButtonHTMLAttributes } from 'react';

export type FixoraButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type FixoraButtonSize = 'small' | 'medium' | 'large';

export interface FixoraButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: FixoraButtonVariant;
	size?: FixoraButtonSize;
	fullWidth?: boolean;
}

const FixoraButton = ({
	variant = 'primary',
	size,
	fullWidth = false,
	className = '',
	children,
	type = 'button',
	...rest
}: FixoraButtonProps) => {
	const classes = [
		'fixora-btn',
		`fixora-btn--${variant}`,
		size ? `fixora-btn--${size}` : '',
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
