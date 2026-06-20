import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import CircleIcon from '@mui/icons-material/Circle';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { GET_TECHNICIANS } from '../../../apollo/user/query';

const countNewThisMonth = (createdAtList: string[]): number => {
	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	return createdAtList.filter((iso) => {
		const created = new Date(iso);
		return created >= monthStart && created <= now;
	}).length;
};

const TechniciansPageStats = () => {
	const { t } = useTranslation('common');

	const { data: onlineData } = useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'network-only',
		variables: {
			input: { page: 1, limit: 1, sort: 'averageRating', direction: 'DESC', search: { isOnline: true } },
		},
	});

	const { data: totalData } = useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'network-only',
		variables: {
			input: { page: 1, limit: 1, sort: 'averageRating', direction: 'DESC', search: { isOnline: null } },
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

	// BACKEND_GAPS: GAP-097 — no createdAtFrom filter; count from recent sample
	const { data: recentData } = useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'network-only',
		variables: {
			input: { page: 1, limit: 100, sort: 'createdAt', direction: 'DESC', search: { isOnline: null } },
		},
	});

	const stats = useMemo(() => {
		const online = onlineData?.getTechnicians?.metaCounter?.[0]?.total ?? 0;
		const total = totalData?.getTechnicians?.metaCounter?.[0]?.total ?? 0;
		const topRated = topRatedData?.getTechnicians?.metaCounter?.[0]?.total ?? 0;
		const recentList = recentData?.getTechnicians?.list ?? [];
		const newThisMonth = countNewThisMonth(
			recentList.map((tech: { createdAt?: string }) => tech.createdAt).filter(Boolean) as string[],
		);
		const sampleSize = recentList.length;
		const isApproximate = sampleSize >= 100;

		return { online, total, topRated, newThisMonth, isApproximate };
	}, [onlineData, totalData, topRatedData, recentData]);

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
			value: stats.isApproximate ? `${stats.newThisMonth}+` : stats.newThisMonth,
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
