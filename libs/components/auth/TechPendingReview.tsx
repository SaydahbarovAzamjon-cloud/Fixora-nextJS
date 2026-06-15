import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { FixoraButton } from '../ui';

const TechPendingReview = () => {
	const { t } = useTranslation('auth');
	const router = useRouter();

	return (
		<div className="auth-tech__pending">
			<ScheduleOutlined />
			<h2>{t('tech.pendingTitle')}</h2>
			<p>{t('tech.pendingSubtitle')}</p>
			<p>{t('tech.pendingHint')}</p>
			<FixoraButton variant="primary" fullWidth onClick={() => router.push('/technician/dashboard')}>
				{t('tech.goToDashboard')}
				<ArrowForward fontSize="small" />
			</FixoraButton>
		</div>
	);
};

export default TechPendingReview;
