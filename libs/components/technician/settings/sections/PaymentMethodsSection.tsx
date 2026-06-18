import React from 'react';
import { useTranslation } from 'next-i18next';
import SettingsSectionHead from '../SettingsSectionHead';
import SettingsEmptyBackend from '../SettingsEmptyBackend';

const PaymentMethodsSection: React.FC = () => {
	const { t } = useTranslation('technician');

	return (
		<div className="fts-section">
			<SettingsSectionHead title={t('settings.payment.title')} desc={t('settings.payment.desc')} />
			<SettingsEmptyBackend gapId="GAP-093" descKey="settings.backendPending.payment" />
		</div>
	);
};

export default PaymentMethodsSection;
