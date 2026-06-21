import { useEffect, useState } from 'react';
import {
	getSavedTechnicianCount,
	SAVED_TECHNICIANS_CHANGED,
} from '../utils/savedTechnicians';

export function useSavedTechnicianCount(userId?: string): number {
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!userId) {
			setCount(0);
			return;
		}

		const refresh = () => setCount(getSavedTechnicianCount(userId));
		refresh();

		const onChanged = (event: Event) => {
			const detail = (event as CustomEvent<{ userId?: string }>).detail;
			if (!detail?.userId || detail.userId === userId) refresh();
		};

		window.addEventListener(SAVED_TECHNICIANS_CHANGED, onChanged);
		return () => window.removeEventListener(SAVED_TECHNICIANS_CHANGED, onChanged);
	}, [userId]);

	return count;
}
