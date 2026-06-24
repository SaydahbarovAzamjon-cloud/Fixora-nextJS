import type { FixoraThemeMode } from '../../theme/fixoraThemeMode';

export const FIXORA_SPLASH_DARK_PALETTE = ['#FF6B35', '#FF7A45', '#FF8C42'] as const;
export const FIXORA_SPLASH_LIGHT_PALETTE = ['#FF8A65', '#FF7043', '#FFAB91'] as const;

export type FixoraSplashIntensity = 'desktop' | 'mobile';

export function getFixoraSplashProps(mode: FixoraThemeMode, intensity: FixoraSplashIntensity) {
	const isLight = mode === 'light';
	const isMobile = intensity === 'mobile';

	return {
		SIM_RESOLUTION: isMobile ? 64 : 128,
		DYE_RESOLUTION: isMobile ? 720 : 1440,
		CAPTURE_RESOLUTION: isMobile ? 384 : 512,
		DENSITY_DISSIPATION: isMobile ? 4 : 3.5,
		VELOCITY_DISSIPATION: isMobile ? 2.5 : 2,
		PRESSURE: 0.1,
		PRESSURE_ITERATIONS: isMobile ? 14 : 20,
		CURL: isMobile ? 2 : 3,
		SPLAT_RADIUS: isMobile ? 0.16 : 0.2,
		SPLAT_FORCE: isMobile ? 3500 : 6000,
		SHADING: !isMobile,
		COLOR_UPDATE_SPEED: isLight ? 12 : 10,
		TRANSPARENT: true,
		RAINBOW_MODE: false,
		colorPalette: [...(isLight ? FIXORA_SPLASH_LIGHT_PALETTE : FIXORA_SPLASH_DARK_PALETTE)],
		colorIntensity: isLight ? 0.22 : 0.14,
	} as const;
}
