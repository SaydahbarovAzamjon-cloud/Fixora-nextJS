import React from 'react';
import { useTranslation } from 'next-i18next';
import CloudOffOutlined from '@mui/icons-material/CloudOffOutlined';

interface SettingsEmptyBackendProps {
	gapId: string;
	titleKey?: string;
	descKey?: string;
	onRetry?: () => void;
}

const SettingsEmptyBackend: React.FC<SettingsEmptyBackendProps> = ({
	gapId,
	titleKey = 'settings.backendPending.title',
	descKey = 'settings.backendPending.desc',
	onRetry,
}) => {
	const { t } = useTranslation('technician');

	return (
		<div className="fts-backend-pending">
			<div className="fts-backend-pending__icon">
				<CloudOffOutlined style={{ fontSize: 28, color: '#606060' }} />
			</div>
			<h3 className="fts-backend-pending__title">{t(titleKey)}</h3>
			<p className="fts-backend-pending__desc">{t(descKey, { gap: gapId })}</p>
			<span className="fts-backend-pending__gap">{gapId}</span>
			{onRetry && (
				<button type="button" className="fts-backend-pending__retry" onClick={onRetry}>
					{t('settings.backendPending.retry')}
				</button>
			)}
		</div>
	);
};

export default SettingsEmptyBackend;
