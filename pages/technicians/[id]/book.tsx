import React, { useMemo } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery } from '@apollo/client';
import { Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import withLayoutFull from '../../../libs/components/layout/LayoutFull';
import BookingForm from '../../../libs/components/booking/BookingForm';
import { GET_USER } from '../../../apollo/user/query';
import { TechnicianProfile } from '../../../libs/types/fixora/fixora';
import { resolveTechnicianDeviceCategory } from '../../../libs/utils/technicianDeviceCategory';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const TechnicianBookPage: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const id = router.query.id as string | undefined;

	const { data: userData } = useQuery(GET_USER, {
		skip: !id,
		variables: { userId: id },
		fetchPolicy: 'network-only',
	});

	const technician: TechnicianProfile | null = userData?.getUser ?? null;
	const technicianDeviceCategory = useMemo(
		() =>
			resolveTechnicianDeviceCategory({
				specialty: technician?.specialty,
				services: technician?.services,
			}),
		[technician?.specialty, technician?.services],
	);

	if (!id) return null;

	return (
		<Stack className="fixora-tech-profile-page">
			<Stack className="container fixora-booking-page">
				<Link href={`/technicians/${id}`} className="fixora-tech-profile__back">
					<ArrowBackIcon fontSize="small" />
					{t('technicianProfile.backToSearch')}
				</Link>

				<h1 className="fixora-booking-page__title">
					{t('booking.title', { technician: technician?.shopName ?? technician?.userFullName ?? '' })}
				</h1>

				<BookingForm
					technicianId={id}
					technicianName={technician?.shopName ?? technician?.userFullName}
					technicianDeviceCategory={technicianDeviceCategory}
				/>
			</Stack>
		</Stack>
	);
};

export default withLayoutFull(TechnicianBookPage);
