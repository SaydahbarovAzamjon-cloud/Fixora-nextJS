import React from 'react';

export type FixoraLogoSize = 'sm' | 'md' | 'lg';

export interface FixoraLogoProps {
	variant?: 'full' | 'mark';
	size?: FixoraLogoSize;
	className?: string;
}

/** Full user logo — tagline visibility enhanced in logo-web.png */
const LOGO_SRC = '/img/logo/logo-web.png';

const FixoraLogo = ({ variant = 'full', size = 'md', className }: FixoraLogoProps) => {
	return (
		<div
			className={[
				'fixora-logo',
				`fixora-logo--${size}`,
				variant === 'mark' ? 'fixora-logo--mark' : 'fixora-logo--full',
				className,
			]
				.filter(Boolean)
				.join(' ')}
			aria-label="Fixora"
		>
			<img src={LOGO_SRC} alt="Fixora" className="fixora-logo__image" />
		</div>
	);
};

export default FixoraLogo;
