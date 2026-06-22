import React from 'react';
import { useTranslation } from 'next-i18next';

interface AdminGapBannerProps {
	gapKey: 'gap071' | 'gap072' | 'gap073' | 'gap074' | 'gap075' | 'gap076' | 'gap077';
}

const AdminGapBanner: React.FC<AdminGapBannerProps> = ({ gapKey }) => {
	const { t } = useTranslation('admin');
	return (
		<div className="fixora-admin-gap-banner" role="status">
			<strong>{t('gap.backendRequired')}</strong>
			<span>{t(`gap.${gapKey}`)}</span>
		</div>
	);
};

export default AdminGapBanner;
