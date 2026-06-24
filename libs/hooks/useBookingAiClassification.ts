import { useEffect, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { CLASSIFY_REPAIR_ISSUE } from '../../apollo/user/ai';
import type { IssueClassificationResult } from '../types/fixora/fixora';

const MIN_TEXT_LENGTH = 10;
const DEBOUNCE_MS = 700;

export function useBookingAiClassification(problemText: string) {
	const [classification, setClassification] = useState<IssueClassificationResult | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastRequestedRef = useRef('');

	const [classify, { loading }] = useLazyQuery(CLASSIFY_REPAIR_ISSUE, {
		fetchPolicy: 'network-only',
		onCompleted: (data) => {
			setClassification(data?.classifyRepairIssue ?? null);
		},
		onError: () => {
			setClassification(null);
		},
	});

	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);

		const trimmed = problemText.trim();
		if (trimmed.length < MIN_TEXT_LENGTH) {
			setClassification(null);
			lastRequestedRef.current = '';
			return;
		}

		debounceRef.current = setTimeout(() => {
			if (trimmed === lastRequestedRef.current) return;
			lastRequestedRef.current = trimmed;
			classify({ variables: { input: { problemText: trimmed } } });
		}, DEBOUNCE_MS);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [problemText, classify]);

	return { classification, loading };
}
