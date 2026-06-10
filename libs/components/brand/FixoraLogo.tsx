import React from 'react';
import FixoraMark from './FixoraMark';

export type FixoraLogoSize = 'sm' | 'md' | 'lg';

export interface FixoraLogoProps {
	variant?: 'full' | 'mark';
	size?: FixoraLogoSize;
	showTagline?: boolean;
	tagline?: string;
	className?: string;
}

const SIZE_MAP: Record<FixoraLogoSize, { mark: number; wordmark: number; gap: number }> = {
	sm: { mark: 28, wordmark: 15, gap: 8 },
	md: { mark: 36, wordmark: 18, gap: 10 },
	lg: { mark: 44, wordmark: 22, gap: 12 },
};

const FixoraLogo = ({
	variant = 'full',
	size = 'md',
	showTagline = false,
	tagline,
	className,
}: FixoraLogoProps) => {
	const dim = SIZE_MAP[size];

	return (
		<div
			className={['fixora-logo', `fixora-logo--${size}`, className].filter(Boolean).join(' ')}
			aria-label="Fixora"
		>
			<div className="fixora-logo__lockup" style={{ gap: dim.gap }}>
				<FixoraMark size={dim.mark} className="fixora-logo__mark" />
				{variant === 'full' && (
					<span className="fixora-logo__wordmark" style={{ fontSize: dim.wordmark }}>
						FIXORA
					</span>
				)}
			</div>
			{showTagline && tagline ? <p className="fixora-logo__tagline">{tagline}</p> : null}
		</div>
	);
};

export default FixoraLogo;
