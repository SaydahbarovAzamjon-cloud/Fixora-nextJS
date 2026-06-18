import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import SettingsSectionHead from '../SettingsSectionHead';
import SettingsField from '../SettingsField';
import SettingsSaveButton from '../SettingsSaveButton';
import SettingsEmptyBackend from '../SettingsEmptyBackend';
import { sweetMixinErrorAlert } from '../../../../sweetAlert';

interface SecuritySettingsSectionProps {
	onSavePassword: (password: string) => Promise<boolean>;
	saving: boolean;
	userEmail?: string | null;
	userPhone?: string | null;
}

const SecuritySettingsSection: React.FC<SecuritySettingsSectionProps> = ({
	onSavePassword,
	saving,
	userEmail,
	userPhone,
}) => {
	const { t } = useTranslation('technician');
	const [currentPw, setCurrentPw] = useState('');
	const [newPw, setNewPw] = useState('');
	const [confirmPw, setConfirmPw] = useState('');
	const [showCurrent, setShowCurrent] = useState(false);

	const handleSave = async () => {
		if (newPw.length < 8) {
			await sweetMixinErrorAlert(t('settings.security.passwordMin'));
			return;
		}
		if (newPw !== confirmPw) {
			await sweetMixinErrorAlert(t('settings.security.passwordMismatch'));
			return;
		}
		if (!currentPw.trim()) {
			await sweetMixinErrorAlert(t('settings.security.currentRequired'));
			return;
		}
		const ok = await onSavePassword(newPw);
		if (ok) {
			setCurrentPw('');
			setNewPw('');
			setConfirmPw('');
		}
	};

	return (
		<div className="fts-section">
			<SettingsSectionHead title={t('settings.security.title')} desc={t('settings.security.desc')} />

			<div className="fts-card fts-card--spaced">
				<h3 className="fts-card__title">{t('settings.security.changePassword')}</h3>
				<SettingsField label={t('settings.security.currentPassword')}>
					<div className="fts-input-wrap">
						<input
							className="fts-input"
							type={showCurrent ? 'text' : 'password'}
							value={currentPw}
							onChange={(e) => setCurrentPw(e.target.value)}
							placeholder="••••••••••"
						/>
						<button type="button" className="fts-input-wrap__eye" onClick={() => setShowCurrent(!showCurrent)}>
							{showCurrent ? <VisibilityOffOutlined style={{ fontSize: 14 }} /> : <VisibilityOutlined style={{ fontSize: 14 }} />}
						</button>
					</div>
				</SettingsField>
				<SettingsField label={t('settings.security.newPassword')}>
					<input
						className="fts-input"
						type="password"
						value={newPw}
						onChange={(e) => setNewPw(e.target.value)}
						placeholder={t('settings.security.newPasswordHint')}
					/>
				</SettingsField>
				<SettingsField label={t('settings.security.confirmPassword')}>
					<input
						className="fts-input"
						type="password"
						value={confirmPw}
						onChange={(e) => setConfirmPw(e.target.value)}
						placeholder={t('settings.security.confirmPasswordHint')}
					/>
				</SettingsField>
				<p className="fts-hint">{t('settings.security.gap090Hint')}</p>
				<SettingsSaveButton onClick={handleSave} loading={saving} label={t('settings.saveChanges')} />
			</div>

			<div className="fts-card">
				<h3 className="fts-card__title">{t('settings.security.twoFactor')}</h3>
				<SettingsEmptyBackend
					gapId="GAP-091"
					descKey="settings.backendPending.twoFactor"
					titleKey="settings.backendPending.twoFactorTitle"
				/>
				{(userEmail || userPhone) && (
					<p className="fts-hint fts-hint--muted">
						{t('settings.security.twoFactorFuture', { email: userEmail ?? '—', phone: userPhone ?? '—' })}
					</p>
				)}
			</div>
		</div>
	);
};

export default SecuritySettingsSection;
