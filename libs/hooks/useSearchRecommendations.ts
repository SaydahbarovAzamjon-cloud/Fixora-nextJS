import { useEffect, useMemo, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { RECOMMEND_TECHNICIANS } from '../../apollo/user/ai';
import type { TechnicianRecommendation, TechniciansInquiry } from '../types/fixora/fixora';
import { buildRecommendTechniciansInput } from '../utils/technicianSearch';

const MIN_TEXT_LENGTH = 3;
const TEXT_DEBOUNCE_MS = 500;

function hasRecommendationSignal(search: TechniciansInquiry['search']): boolean {
	const text = search.text?.trim() ?? '';
	return text.length >= MIN_TEXT_LENGTH || !!search.deviceCategory || !!search.issueCategory;
}

export function useSearchRecommendations(searchFilter: TechniciansInquiry) {
	const [recommendations, setRecommendations] = useState<TechnicianRecommendation[]>([]);
	const [debouncedText, setDebouncedText] = useState(searchFilter.search.text?.trim() ?? '');
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastKeyRef = useRef('');

	const visible = hasRecommendationSignal(searchFilter.search);

	const requestKey = useMemo(
		() =>
			JSON.stringify({
				text: debouncedText,
				deviceCategory: searchFilter.search.deviceCategory ?? null,
				issueCategory: searchFilter.search.issueCategory ?? null,
			}),
		[debouncedText, searchFilter.search.deviceCategory, searchFilter.search.issueCategory],
	);

	const [fetchRecommendations, { loading }] = useLazyQuery(RECOMMEND_TECHNICIANS, {
		fetchPolicy: 'network-only',
		onCompleted: (data) => {
			setRecommendations(data?.recommendTechnicians?.list ?? []);
		},
		onError: () => {
			setRecommendations([]);
		},
	});

	useEffect(() => {
		const nextText = searchFilter.search.text?.trim() ?? '';
		if (debounceRef.current) clearTimeout(debounceRef.current);

		debounceRef.current = setTimeout(() => {
			setDebouncedText(nextText);
		}, TEXT_DEBOUNCE_MS);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [searchFilter.search.text]);

	useEffect(() => {
		if (!visible) {
			setRecommendations([]);
			lastKeyRef.current = '';
			return;
		}

		if (requestKey === lastKeyRef.current) return;
		lastKeyRef.current = requestKey;

		const parsed = JSON.parse(requestKey) as {
			text: string;
			deviceCategory: string | null;
			issueCategory: string | null;
		};

		const input = buildRecommendTechniciansInput(
			{
				text: parsed.text,
				deviceCategory: parsed.deviceCategory ?? undefined,
				issueCategory: parsed.issueCategory ?? undefined,
			},
			5,
		);

		if (!input.problemText && !input.deviceType && !input.issueCategory) {
			setRecommendations([]);
			return;
		}

		fetchRecommendations({
			variables: { input },
			context: { suppressErrorAlert: true },
		});
	}, [visible, requestKey, fetchRecommendations]);

	return { recommendations, loading, visible };
}
