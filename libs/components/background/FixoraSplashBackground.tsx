import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useFixoraTheme } from '../theme/FixoraThemeProvider';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { getFixoraSplashProps } from './fixoraSplashConfig';

const SplashCursor = dynamic(() => import('./SplashCursor'), { ssr: false });

const FixoraSplashBackground = () => {
	const { mode } = useFixoraTheme();
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';
	const [reducedMotion, setReducedMotion] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => setReducedMotion(mediaQuery.matches);
		sync();
		mediaQuery.addEventListener('change', sync);
		return () => mediaQuery.removeEventListener('change', sync);
	}, []);

	const splashProps = useMemo(
		() => getFixoraSplashProps(mode, isMobile ? 'mobile' : 'desktop'),
		[mode, isMobile],
	);

	const themeClass = mode === 'light' ? 'fixora-splash-bg--light' : 'fixora-splash-bg--dark';

	return (
		<div className={`fixora-splash-bg ${themeClass}`} aria-hidden="true">
			<div className="fixora-splash-bg__surface" />
			{!reducedMotion && (
				<div className="fixora-splash-bg__fluid">
					<SplashCursor key={`${mode}-${isMobile ? 'mobile' : 'desktop'}`} {...splashProps} />
				</div>
			)}
		</div>
	);
};

export default FixoraSplashBackground;
