import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_TECHNICIANS } from '../../apollo/user/query';
import { TechnicianSummary, TechniciansInquiry } from '../types/fixora/fixora';
import {
	buildDiscoverySections,
	DISCOVERY_POOL_LIMIT,
	DiscoverySection,
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

	const technicians = useMemo(
		() => (data?.getTechnicians?.list ?? []) as TechnicianSummary[],
		[data],
	);

	const sections: DiscoverySection[] = useMemo(
		() => (loading && technicians.length === 0 ? [] : buildDiscoverySections(technicians)),
		[loading, technicians],
	);

	return {
		technicians,
		sections,
		loading,
		error,
		refetch,
	};
}
