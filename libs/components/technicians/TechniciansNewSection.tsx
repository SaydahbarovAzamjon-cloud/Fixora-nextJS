import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_TECHNICIANS } from '../../../apollo/user/query';
import { TechnicianSummary } from '../../types/fixora/fixora';
import { buildNewTechniciansSection } from '../../utils/technicianDiscoverySections';
import TechniciansDiscoveryCarousel from './TechniciansDiscoveryCarousel';

const NEW_INPUT = {
	page: 1,
	limit: 100,
	sort: 'createdAt',
	direction: 'DESC' as const,
	search: { isOnline: null },
};

const TechniciansNewSection = () => {
	const { data, loading } = useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'network-only',
		variables: { input: NEW_INPUT },
	});

	const technicians = useMemo(() => {
		const list = (data?.getTechnicians?.list ?? []) as TechnicianSummary[];
		return buildNewTechniciansSection(list);
	}, [data]);

	return (
		<TechniciansDiscoveryCarousel
			titleKey="technicians.sections.newTechnicians"
			technicians={technicians}
			loading={loading}
			sectionClassName="fixora-tech-list-section--new"
		/>
	);
};

export default TechniciansNewSection;
