import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_TECHNICIAN_TRENDING, GET_TECHNICIANS } from '../../apollo/user/query';
import { TechnicianSummary, TechniciansInquiry } from '../types/fixora/fixora';
import {
	buildDiscoverySections,
	DISCOVERY_POOL_LIMIT,
	DISCOVERY_SECTION_LIMIT,
	DiscoverySection,
	FAST_RESPONDERS_INPUT,
} from '../utils/technicianDiscoverySections';

export const DISCOVERY_POOL_INPUT: TechniciansInquiry = {
	page: 1,
	limit: DISCOVERY_POOL_LIMIT,
	sort: 'createdAt',
	direction: 'DESC',
	search: { isOnline: null },
};

export function useTechniciansDiscovery() {
	const { data, loading, error, refetch } = useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'network-only',
		variables: { input: DISCOVERY_POOL_INPUT },
		notifyOnNetworkStatusChange: true,
	});

	const {
		data: fastData,
		loading: fastLoading,
		error: fastError,
	} = useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'network-only',
		variables: { input: FAST_RESPONDERS_INPUT },
	});

	const technicians = useMemo(
		() => (data?.getTechnicians?.list ?? []) as TechnicianSummary[],
		[data],
	);

	const fastResponders = useMemo(
		() => (fastData?.getTechnicians?.list ?? []) as TechnicianSummary[],
		[fastData],
	);

	const {
		data: trendingData,
		loading: trendingLoading,
		error: trendingError,
	} = useQuery(GET_TECHNICIAN_TRENDING, {
		fetchPolicy: 'network-only',
		variables: { limit: DISCOVERY_SECTION_LIMIT },
	});

	const trending = useMemo(
		() => (trendingData?.getTechnicianTrending?.list ?? []) as TechnicianSummary[],
		[trendingData],
	);

	const sections: DiscoverySection[] = useMemo(
		() =>
			loading && technicians.length === 0
				? []
				: buildDiscoverySections(technicians, { trending, fastResponders }),
		[loading, technicians, trending, fastResponders],
	);

	return {
		technicians,
		sections,
		loading: loading || fastLoading || trendingLoading,
		error: error ?? fastError ?? trendingError,
		refetch,
	};
}
