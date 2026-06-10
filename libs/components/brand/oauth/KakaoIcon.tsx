import React from 'react';

export interface OAuthIconProps {
	size?: number;
	className?: string;
}

const KakaoIcon = ({ size = 20, className }: OAuthIconProps) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		aria-hidden
	>
		<rect width="24" height="24" rx="6" fill="#FEE500" />
		<path
			d="M12 5.5c-4.14 0-7.5 2.69-7.5 6 0 1.89 1.01 3.59 2.59 4.74l-.84 3.11 3.38-2.24c.58.09 1.18.14 1.87.14 4.14 0 7.5-2.69 7.5-6s-3.36-6-7.5-6z"
			fill="#191919"
		/>
	</svg>
);

export default KakaoIcon;
