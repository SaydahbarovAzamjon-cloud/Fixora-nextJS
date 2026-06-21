import React from 'react';
import FixoraMark from './FixoraMark';

export type FixoraLogoSize = 'sm' | 'md' | 'lg';

export interface FixoraLogoProps {
	variant?: 'full' | 'mark';
	size?: FixoraLogoSize;
	className?: string;
}

const LOGO_FULL_SRC = '/img/logo/fixora-full.svg';

const MARK_SIZES: Record<FixoraLogoSize, number> = {
	sm: 52,
	md: 64,
	lg: 80,
};

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
			{variant === 'mark' ? (
				<FixoraMark size={MARK_SIZES[size]} className="fixora-logo__mark" />
			) : (
				<img src={LOGO_FULL_SRC} alt="Fixora" className="fixora-logo__image" />
			)}
		</div>
	);
};

export default FixoraLogo;
