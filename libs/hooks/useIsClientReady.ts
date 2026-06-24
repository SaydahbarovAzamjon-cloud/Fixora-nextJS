import { useSyncExternalStore } from 'react';

function subscribe() {
	return () => {};
}

/** False during SSR and the hydration pass; true after the client has mounted. */
export function useIsClientReady(): boolean {
	return useSyncExternalStore(subscribe, () => true, () => false);
}
