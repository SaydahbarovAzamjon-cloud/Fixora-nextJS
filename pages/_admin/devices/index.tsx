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

import AdminSelect from '../../../libs/components/admin/shared/AdminSelect';

import AdminDevicePersonRow from '../../../libs/components/admin/devices/AdminDevicePersonRow';

import { GET_ALL_DEVICES_BY_ADMIN } from '../../../apollo/admin/query';

import type { AdminDevice } from '../../../libs/types/admin/admin';

import type { DeviceCategory, DeviceStatus } from '../../../libs/types/fixora/fixora';

import { useUserLookup } from '../../../libs/hooks/useUserLookup';

import { useDeviceTechnicianMap } from '../../../libs/hooks/useDeviceTechnicianMap';

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
		errorPolicy: 'all',
	});

	const list: AdminDevice[] = data?.getAllDevicesByAdmin?.list ?? [];
	const showInitialLoading = loading && !data?.getAllDevicesByAdmin;
	const showEmpty = !loading && list.length === 0;

	const ownerIds = list.map((d) => d.userId);

	const deviceIds = list.map((d) => d._id);

	const { user: ownerUser } = useUserLookup(ownerIds);

	const { technicianId } = useDeviceTechnicianMap(deviceIds);

	const technicianIds = list.map((d) => technicianId(d._id)).filter(Boolean) as string[];

	const { user: technicianUser } = useUserLookup(technicianIds);

	return (

		<>

			<AdminHeader title={t('devices.title')} subtitle={t('devices.subtitle')} />

			<div className="fixora-admin-page">

				<div className="fixora-admin-table-toolbar fixora-admin-toolbar-row--filters">

					<AdminSearchBar value={search} onChange={setSearch} placeholder={t('devices.searchPlaceholder')} />

					<AdminSelect

						value={categoryFilter}

						onChange={(e) => setCategoryFilter(e.target.value as DeviceCategory | '')}

						options={[

							{ value: '', label: t('devices.allCategories') },

							{ value: 'IPHONE', label: 'IPHONE' },

							{ value: 'IPAD', label: 'IPAD' },

							{ value: 'MACBOOK', label: 'MACBOOK' },

							{ value: 'APPLE_WATCH', label: 'APPLE WATCH' },

						]}

						aria-label={t('devices.allCategories')}

					/>

					<AdminSelect

						value={statusFilter}

						onChange={(e) => setStatusFilter(e.target.value as DeviceStatus | '')}

						options={[

							{ value: '', label: t('devices.allStatuses') },

							{ value: 'ACTIVE', label: 'ACTIVE' },

							{ value: 'INACTIVE', label: 'INACTIVE' },

							{ value: 'IN_REPAIR', label: 'IN_REPAIR' },

							{ value: 'REPAIR_COMPLETE', label: 'REPAIR_COMPLETE' },

						]}

						aria-label={t('devices.allStatuses')}

					/>

				</div>



				{showInitialLoading && <div className="fixora-admin-empty">{t('common.loading')}</div>}
				{showEmpty && <div className="fixora-admin-empty">{t('devices.empty')}</div>}



				<div className="fixora-admin-device-grid">

					{list.map((device) => {
						const techId = technicianId(device._id);
						const technician = techId ? technicianUser(techId) : undefined;

						return (

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

								<p className="fixora-admin-device-card__issue">{device.deviceIssue}</p>

								<div className="fixora-admin-device-card__people">

									<AdminDevicePersonRow

										label={t('devices.client')}

										user={ownerUser(device.userId)}

										fallbackId={device.userId}

									/>

									<AdminDevicePersonRow
										label={t('devices.technician')}
										user={technician}
										emptyLabel={t('devices.noTechnician')}
									/>

								</div>

								<div className="fixora-admin-device-card__footer">

									<AdminStatusBadge label={device.deviceCategory} tone={deviceCategoryTone(device.deviceCategory)} />

									<span className="fixora-admin-verification__list-meta">{device.releaseYear ?? '—'}</span>

								</div>

							</div>

						);

					})}

				</div>

			</div>

		</>

	);

};



export const getServerSideProps = adminPageProps;



export default withAdminLayout(AdminDevicesPage, { title: 'Devices' });


