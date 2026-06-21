import React, { useId } from 'react';

export interface FixoraMarkProps {
	size?: number;
	className?: string;
}

const FixoraMark = ({ size = 40, className }: FixoraMarkProps) => {
	const uid = useId().replace(/:/g, '');
	const gradId = `fixora-mark-grad-${uid}`;
	const glowId = `fixora-mark-glow-${uid}`;

	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 40 40"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden
		>
			<defs>
				<linearGradient id={gradId} x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
					<stop stopColor="#8E1428" />
					<stop offset="1" stopColor="#480415" />
				</linearGradient>
				<filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
					<feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#730C1E" floodOpacity="0.45" />
				</filter>
			</defs>
			<rect
				x="1"
				y="1"
				width="38"
				height="38"
				rx="11"
				fill={`url(#${gradId})`}
				stroke="rgba(255,255,255,0.14)"
				strokeWidth="1"
			/>
			<g filter={`url(#${glowId})`}>
				<path
					d="M13.5 13.5L26.5 26.5"
					stroke="#FFFFFF"
					strokeWidth="3.25"
					strokeLinecap="round"
				/>
				<path
					d="M26.5 13.5L13.5 26.5"
					stroke="#FFFFFF"
					strokeWidth="3.25"
					strokeLinecap="round"
				/>
			</g>
		</svg>
	);
};

export default FixoraMark;
