import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import withLayoutFull from '../../../libs/components/layout/LayoutFull';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const TechnicianBookPage: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const { id } = router.query;

	return (
		<Stack className="fixora-tech-profile-page">
			<Stack className="container">
				{id && (
					<Link href={`/technicians/${id}`} className="fixora-tech-profile__back">
						<ArrowBackIcon fontSize="small" />
						{t('technicianProfile.backToSearch')}
					</Link>
				)}
				<div className="fixora-tech-profile__book-placeholder">{t('technicianProfile.book.comingSoon')}</div>
			</Stack>
		</Stack>
	);
};

export default withLayoutFull(TechnicianBookPage);
