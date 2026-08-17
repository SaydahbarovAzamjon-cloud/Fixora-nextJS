/** Fixora theme mode — localStorage + DOM `data-theme` (P4-05 / P4-07) */

export type FixoraThemeMode = 'dark' | 'light';

export const FIXORA_THEME_STORAGE_KEY = 'fixora_theme_mode';

export const DEFAULT_FIXORA_THEME_MODE: FixoraThemeMode = 'light';

export function isFixoraThemeMode(value: unknown): value is FixoraThemeMode {
	return value === 'dark' || value === 'light';
}

export function getStoredFixoraThemeMode(): FixoraThemeMode {
	if (typeof window === 'undefined') return DEFAULT_FIXORA_THEME_MODE;

	try {
		const stored = window.localStorage.getItem(FIXORA_THEME_STORAGE_KEY);
		if (isFixoraThemeMode(stored)) return stored;
	} catch {
		/* ignore */
	}

	return DEFAULT_FIXORA_THEME_MODE;
}

export function applyFixoraThemeMode(mode: FixoraThemeMode): void {
	if (typeof document === 'undefined') return;

	const root = document.documentElement;
	root.setAttribute('data-theme', mode);

	if (mode === 'light') {
		root.classList.add('theme-light');
	} else {
		root.classList.remove('theme-light');
	}
}

export function setStoredFixoraThemeMode(mode: FixoraThemeMode): void {
	if (typeof window === 'undefined') return;

	try {
		window.localStorage.setItem(FIXORA_THEME_STORAGE_KEY, mode);
	} catch {
		/* ignore */
	}

	applyFixoraThemeMode(mode);
}

/** Inline bootstrap for _document.tsx — prevents theme flash on load */
export const FIXORA_THEME_BOOTSTRAP_SCRIPT = `(function(){try{var m=localStorage.getItem('${FIXORA_THEME_STORAGE_KEY}');if(m==='dark'){document.documentElement.setAttribute('data-theme','dark');document.documentElement.classList.remove('theme-light');}else{document.documentElement.setAttribute('data-theme','light');document.documentElement.classList.add('theme-light');}}catch(e){}})();`;
