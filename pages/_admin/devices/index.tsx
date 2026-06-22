import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { Smartphone, Laptop, Tablet, Watch } from 'lucide-react';
import withAdminLayout from '../../../libs/components/layout/AdminLayout';
import { adminPageProps } from '../../../libs/i18n/adminPageProps';
import AdminHeader from '../../../libs/components/admin/AdminHeader';
import AdminSearchBar from '../../../libs/components/admin/shared/AdminSearchBar';
import AdminStatusBadge from '../../../libs/components/admin/shared/AdminStatusBadge';
import { GET_ALL_DEVICES_BY_ADMIN } from '../../../apollo/admin/query';
import type { AdminDevice } from '../../../libs/types/admin/admin';
import type { DeviceCategory, DeviceStatus } from '../../../libs/types/fixora/fixora';
import { useUserLookup } from '../../../libs/hooks/useUserLookup';
import { bookingStatusTone } from '../../../libs/utils/adminBadges';

const deviceIcon = (category: DeviceCategory) => {
	switch (category) {
		case 'MACBOOK':
			return <Laptop size={16} />;
		case 'IPAD':
			return <Tablet size={16} />;
		case 'APPLE_WATCH':
			return <Watch size={16} />;
		default:
			return <Smartphone size={16} />;
	}
};

const deviceCategoryTone = (category: DeviceCategory) => {
	switch (category) {
		case 'IPHONE':
			return 'blue' as const;
		case 'MACBOOK':
			return 'purple' as const;
		case 'IPAD':
			return 'success' as const;
		case 'APPLE_WATCH':
			return 'warning' as const;
		default:
			return 'neutral' as const;
	}
};

const AdminDevicesPage: NextPage = () => {
	const { t } = useTranslation('admin');
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [categoryFilter, setCategoryFilter] = useState<DeviceCategory | ''>('');
	const [statusFilter, setStatusFilter] = useState<DeviceStatus | ''>('');

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search), 350);
		return () => clearTimeout(timer);
	}, [search]);

	const { data, loading } = useQuery(GET_ALL_DEVICES_BY_ADMIN, {
		variables: {
			input: {
				page: 1,
				limit: 50,
				search: {
					text: debouncedSearch || undefined,
					deviceCategory: categoryFilter || undefined,
					deviceStatus: statusFilter || undefined,
				},
			},
		},
		fetchPolicy: 'cache-and-network',
	});

	const list: AdminDevice[] = data?.getAllDevicesByAdmin?.list ?? [];
	const ownerIds = list.map((d) => d.userId);
	const { name: ownerName } = useUserLookup(ownerIds);

	return (
		<>
			<AdminHeader title={t('devices.title')} subtitle={t('devices.subtitle')} />
			<div className="fixora-admin-page">
				<div className="fixora-admin-table-toolbar" style={{ marginBottom: 16, background: 'transparent', border: 'none', padding: 0 }}>
					<AdminSearchBar value={search} onChange={setSearch} placeholder={t('devices.searchPlaceholder')} />
					<select
						className="fixora-admin-select"
						value={categoryFilter}
						onChange={(e) => setCategoryFilter(e.target.value as DeviceCategory | '')}
					>
						<option value="">{t('devices.allCategories')}</option>
						<option value="IPHONE">IPHONE</option>
						<option value="IPAD">IPAD</option>
						<option value="MACBOOK">MACBOOK</option>
						<option value="APPLE_WATCH">APPLE WATCH</option>
					</select>
					<select
						className="fixora-admin-select"
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value as DeviceStatus | '')}
					>
						<option value="">{t('devices.allStatuses')}</option>
						<option value="ACTIVE">ACTIVE</option>
						<option value="INACTIVE">INACTIVE</option>
						<option value="IN_REPAIR">IN_REPAIR</option>
						<option value="REPAIR_COMPLETE">REPAIR_COMPLETE</option>
					</select>
				</div>

				{loading && <div className="fixora-admin-empty">{t('common.loading')}</div>}
				{!loading && list.length === 0 && <div className="fixora-admin-empty">{t('devices.empty')}</div>}

				<div className="fixora-admin-device-grid">
					{list.map((device) => (
						<div key={device._id} className="fixora-admin-device-card">
							<div className="fixora-admin-device-card__top">
								{deviceIcon(device.deviceCategory)}
								<AdminStatusBadge
									label={t(`devices.status.${device.deviceStatus}`, { defaultValue: device.deviceStatus })}
									tone={bookingStatusTone(
										device.deviceStatus === 'IN_REPAIR'
											? 'IN_PROGRESS'
											: device.deviceStatus === 'REPAIR_COMPLETE'
												? 'COMPLETED'
												: 'PENDING',
									)}
								/>
							</div>
							<h3 className="fixora-admin-device-card__title">{device.deviceModel}</h3>
							<p className="fixora-admin-device-card__meta">
								{t('devices.owner', { name: ownerName(device.userId) })}
							</p>
							<p className="fixora-admin-device-card__meta">{device.deviceIssue}</p>
							<div className="fixora-admin-device-card__footer">
								<AdminStatusBadge label={device.deviceCategory} tone={deviceCategoryTone(device.deviceCategory)} />
								<span style={{ fontSize: 12, color: 'var(--fixora-text-muted)' }}>{device.releaseYear ?? '—'}</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
};

export const getServerSideProps = adminPageProps;

export default withAdminLayout(AdminDevicesPage, { title: 'Devices' });
