import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import CircleIcon from '@mui/icons-material/Circle';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { GET_TECHNICIAN_PLATFORM_STATS, GET_TECHNICIANS } from '../../../apollo/user/query';

const TechniciansPageStats = () => {
	const { t } = useTranslation('common');

	const { data: platformData } = useQuery(GET_TECHNICIAN_PLATFORM_STATS, {
		fetchPolicy: 'network-only',
	});

	const { data: onlineData } = useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'network-only',
		variables: {
			input: { page: 1, limit: 1, sort: 'averageRating', direction: 'DESC', search: { isOnline: true } },
		},
	});

	const { data: topRatedData } = useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 1,
				sort: 'averageRating',
				direction: 'DESC',
				search: { isOnline: null, minAverageRating: 4.5 },
			},
		},
	});

	const stats = useMemo(() => {
		const platform = platformData?.getTechnicianPlatformStats;
		const online = onlineData?.getTechnicians?.metaCounter?.[0]?.total ?? 0;
		const total = platform?.totalTechnicians ?? 0;
		const topRated = topRatedData?.getTechnicians?.metaCounter?.[0]?.total ?? 0;
		const newThisMonth = platform?.joinedThisMonth ?? 0;

		return { online, total, topRated, newThisMonth };
	}, [platformData, onlineData, topRatedData]);

	const items = [
		{
			key: 'online',
			icon: CircleIcon,
			iconClass: 'fixora-tech-list-stats__icon--online',
			label: t('technicians.stats.online'),
			value: stats.online,
		},
		{
			key: 'total',
			icon: GroupsOutlinedIcon,
			iconClass: 'fixora-tech-list-stats__icon--total',
			label: t('technicians.stats.total'),
			value: stats.total,
		},
		{
			key: 'topRated',
			icon: StarOutlineIcon,
			iconClass: 'fixora-tech-list-stats__icon--rating',
			label: t('technicians.stats.topRated'),
			value: stats.topRated,
		},
		{
			key: 'newThisMonth',
			icon: PersonAddOutlinedIcon,
			iconClass: 'fixora-tech-list-stats__icon--new',
			label: t('technicians.stats.newThisMonth'),
			value: stats.newThisMonth,
		},
	];

	return (
		<div className="fixora-tech-list-stats">
			{items.map(({ key, icon: Icon, iconClass, label, value }) => (
				<div className="fixora-tech-list-stats__card" key={key}>
					<span className={`fixora-tech-list-stats__icon ${iconClass}`}>
						<Icon fontSize="inherit" />
					</span>
					<div className="fixora-tech-list-stats__text">
						<strong>{value}</strong>
						<span>{label}</span>
					</div>
				</div>
			))}
		</div>
	);
};

export default TechniciansPageStats;
