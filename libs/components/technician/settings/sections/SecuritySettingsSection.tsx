import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import SettingsSectionHead from '../SettingsSectionHead';
import SettingsField from '../SettingsField';
import SettingsSaveButton from '../SettingsSaveButton';
import SettingsToggle from '../SettingsToggle';
import {
	DISABLE_2FA,
	ENABLE_2FA,
	GET_TWO_FACTOR_STATUS,
	VERIFY_2FA_SETUP,
} from '../../../../../apollo/user/settings';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../../sweetAlert';

interface SecuritySettingsSectionProps {
	onSavePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
	saving: boolean;
}

const SecuritySettingsSection: React.FC<SecuritySettingsSectionProps> = ({ onSavePassword, saving }) => {
	const { t } = useTranslation('technician');
	const [currentPw, setCurrentPw] = useState('');
	const [newPw, setNewPw] = useState('');
	const [confirmPw, setConfirmPw] = useState('');
	const [showCurrent, setShowCurrent] = useState(false);
	const [totpCode, setTotpCode] = useState('');
	const [disablePw, setDisablePw] = useState('');
	const [setupUri, setSetupUri] = useState<string | null>(null);
	const [setupSecret, setSetupSecret] = useState<string | null>(null);

	const { data: twoFactorData, refetch: refetchTwoFactor } = useQuery(GET_TWO_FACTOR_STATUS, {
		fetchPolicy: 'network-only',
	});
	const twoFactorEnabled = twoFactorData?.getTwoFactorStatus === true;

	const [enable2FA, { loading: enabling }] = useMutation(ENABLE_2FA);
	const [verify2FASetup, { loading: verifying }] = useMutation(VERIFY_2FA_SETUP);
	const [disable2FA, { loading: disabling }] = useMutation(DISABLE_2FA);

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
		const ok = await onSavePassword(currentPw, newPw);
		if (ok) {
			setCurrentPw('');
			setNewPw('');
			setConfirmPw('');
		}
	};

	const handleEnable2FA = async () => {
		try {
			const { data } = await enable2FA();
			setSetupUri(data?.enable2FA?.provisioningUri ?? null);
			setSetupSecret(data?.enable2FA?.secret ?? null);
		} catch {
			await sweetMixinErrorAlert(t('settings.security.twoFactorEnableFailed'));
		}
	};

	const handleVerify2FA = async () => {
		if (!totpCode.trim()) return;
		try {
			await verify2FASetup({ variables: { input: { code: totpCode.trim() } } });
			setSetupUri(null);
			setSetupSecret(null);
			setTotpCode('');
			await refetchTwoFactor();
			await sweetTopSmallSuccessAlert(t('settings.security.twoFactorEnabled'), 1200);
		} catch {
			await sweetMixinErrorAlert(t('settings.security.twoFactorVerifyFailed'));
		}
	};

	const handleDisable2FA = async () => {
		if (!disablePw.trim()) {
			await sweetMixinErrorAlert(t('settings.security.currentRequired'));
			return;
		}
		try {
			await disable2FA({ variables: { input: { currentPassword: disablePw } } });
			setDisablePw('');
			await refetchTwoFactor();
			await sweetTopSmallSuccessAlert(t('settings.security.twoFactorDisabled'), 1200);
		} catch {
			await sweetMixinErrorAlert(t('settings.security.twoFactorDisableFailed'));
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
				<SettingsSaveButton onClick={handleSave} loading={saving} label={t('settings.saveChanges')} />
			</div>

			<div className="fts-card">
				<h3 className="fts-card__title">{t('settings.security.twoFactor')}</h3>
				<div className="fts-toggle-row">
					<span>{twoFactorEnabled ? t('settings.security.twoFactorOn') : t('settings.security.twoFactorOff')}</span>
					<SettingsToggle
						on={twoFactorEnabled}
						onChange={() => undefined}
						disabled
						ariaLabel={t('settings.security.twoFactor')}
					/>
				</div>

				{!twoFactorEnabled && !setupUri && (
					<SettingsSaveButton onClick={handleEnable2FA} loading={enabling} label={t('settings.security.enable2FA')} />
				)}

				{setupUri && !twoFactorEnabled && (
					<div className="fts-2fa-setup">
						<p className="fts-hint">{t('settings.security.scanQr')}</p>
						{setupSecret && (
							<p className="fts-hint fts-hint--muted">
								{t('settings.security.manualSecret', { secret: setupSecret })}
							</p>
						)}
						<SettingsField label={t('settings.security.totpCode')}>
							<input
								className="fts-input"
								value={totpCode}
								onChange={(e) => setTotpCode(e.target.value)}
								placeholder="000000"
							/>
						</SettingsField>
						<SettingsSaveButton onClick={handleVerify2FA} loading={verifying} label={t('settings.security.verify2FA')} />
					</div>
				)}

				{twoFactorEnabled && (
					<div className="fts-2fa-disable">
						<SettingsField label={t('settings.security.currentPassword')}>
							<input
								className="fts-input"
								type="password"
								value={disablePw}
								onChange={(e) => setDisablePw(e.target.value)}
								placeholder="••••••••••"
							/>
						</SettingsField>
						<SettingsSaveButton
							onClick={handleDisable2FA}
							loading={disabling}
							label={t('settings.security.disable2FA')}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default SecuritySettingsSection;
