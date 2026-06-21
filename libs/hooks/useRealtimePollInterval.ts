import { useReactiveVar } from '@apollo/client';
import { fixoraWsConnectedVar } from '../../apollo/store';
import { getJwtToken } from '../auth';

/**
 * Returns 0 when Fixora WS is connected (Apollo refetch via bridge handles updates).
 * Falls back to `fallbackMs` when offline or backend does not emit events (GAP-062).
 */
export function useRealtimePollInterval(fallbackMs: number): number {
	const wsConnected = useReactiveVar(fixoraWsConnectedVar);
	const hasToken = typeof window !== 'undefined' && !!getJwtToken();
	if (!hasToken) return 0;
	return wsConnected ? 0 : fallbackMs;
}

export default useRealtimePollInterval;
