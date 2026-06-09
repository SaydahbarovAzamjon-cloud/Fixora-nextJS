import React, { HTMLAttributes } from 'react';

export interface FixoraGlassCardProps extends HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

const FixoraGlassCard = ({ children, className = '', ...rest }: FixoraGlassCardProps) => {
	return (
		<div className={`fixora-glass-card ${className}`.trim()} {...rest}>
			{children}
		</div>
	);
};

export default FixoraGlassCard;
