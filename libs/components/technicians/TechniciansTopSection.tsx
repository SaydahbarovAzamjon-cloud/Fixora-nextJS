import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_TECHNICIANS } from '../../../apollo/user/query';
import { TechnicianSummary } from '../../types/fixora/fixora';
import { buildTopRatedSection } from '../../utils/technicianDiscoverySections';
import TechniciansDiscoveryCarousel from './TechniciansDiscoveryCarousel';

const TOP_INPUT = {
	page: 1,
	limit: 100,
	sort: 'averageRating',
	direction: 'DESC' as const,
	search: { isOnline: null },
};

const TechniciansTopSection = () => {
	const { data, loading } = useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'network-only',
		variables: { input: TOP_INPUT },
	});

	const technicians = useMemo(() => {
		const list = (data?.getTechnicians?.list ?? []) as TechnicianSummary[];
		return buildTopRatedSection(list);
	}, [data]);

	return (
		<TechniciansDiscoveryCarousel
			titleKey="technicians.sections.topRated"
			technicians={technicians}
			loading={loading}
		/>
	);
};

export default TechniciansTopSection;
