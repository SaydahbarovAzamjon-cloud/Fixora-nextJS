import { useSyncExternalStore } from 'react';
import { FIXORA_ADMIN_MOBILE_MEDIA_QUERY } from '../constants/fixoraBreakpoints';

function getSnapshot(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia(FIXORA_ADMIN_MOBILE_MEDIA_QUERY).matches;
}

function getServerSnapshot(): boolean {
	return false;
}

function subscribe(onStoreChange: () => void): () => void {
	if (typeof window === 'undefined') return () => undefined;
	const mediaQuery = window.matchMedia(FIXORA_ADMIN_MOBILE_MEDIA_QUERY);
	mediaQuery.addEventListener('change', onStoreChange);
	return () => mediaQuery.removeEventListener('change', onStoreChange);
}

/** Admin drawer + mobile top bar — matches admin.scss 1023px breakpoint. */
const useAdminMobileLayout = (): boolean => {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

export default useAdminMobileLayout;
