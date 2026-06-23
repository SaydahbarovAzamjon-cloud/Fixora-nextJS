import { useSyncExternalStore } from 'react';
import { FIXORA_MOBILE_MEDIA_QUERY } from '../constants/fixoraBreakpoints';

export type FixoraViewport = 'mobile' | 'desktop';

function getSnapshot(): FixoraViewport {
	if (typeof window === 'undefined') return 'desktop';
	const hinted = document.documentElement.getAttribute('data-fixora-viewport');
	if (hinted === 'mobile' || hinted === 'desktop') return hinted;
	return window.matchMedia(FIXORA_MOBILE_MEDIA_QUERY).matches ? 'mobile' : 'desktop';
}

function getServerSnapshot(): FixoraViewport {
	return 'desktop';
}

function subscribe(onStoreChange: () => void): () => void {
	if (typeof window === 'undefined') return () => undefined;
	const mediaQuery = window.matchMedia(FIXORA_MOBILE_MEDIA_QUERY);
	mediaQuery.addEventListener('change', onStoreChange);
	return () => mediaQuery.removeEventListener('change', onStoreChange);
}

/** Viewport from SCSS breakpoint (639px) — updates on resize; matches MOB-03. */
const useDeviceDetect = (): string => {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

export default useDeviceDetect;
