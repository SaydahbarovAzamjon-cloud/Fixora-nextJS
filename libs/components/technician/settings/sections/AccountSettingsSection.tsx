import React from 'react';
import { useTranslation } from 'next-i18next';
import SettingsSectionHead from '../SettingsSectionHead';
import SettingsField from '../SettingsField';
import SettingsSaveButton from '../SettingsSaveButton';
import { TechnicianSettingsUser } from '../../../../hooks/useTechnicianSettings';

interface AccountSettingsSectionProps {
	user: TechnicianSettingsUser | null;
	nickname: string;
	onNicknameChange: (v: string) => void;
	onSave: () => Promise<boolean>;
	saving: boolean;
}

const AccountSettingsSection: React.FC<AccountSettingsSectionProps> = ({
	user,
	nickname,
	onNicknameChange,
	onSave,
	saving,
}) => {
	const { t } = useTranslation('technician');
	const isPro =
		user?.badgeLevel === 'PREMIUM_PRO' ||
		user?.badgeLevel === 'VERIFIED' ||
		user?.userType === 'TECHNICIAN';

	return (
		<div className="fts-section">
			<SettingsSectionHead title={t('settings.account.title')} desc={t('settings.account.desc')} />

			<div className="fts-card">
				<SettingsField label={t('settings.account.usernameLabel')}>
					<div className="fts-prefix-input">
						<span className="fts-prefix-input__prefix">{t('settings.account.urlPrefix')}</span>
						<input
							className="fts-prefix-input__control"
							value={nickname}
							onChange={(e) => onNicknameChange(e.target.value)}
						/>
					</div>
				</SettingsField>

				<SettingsField label={t('settings.account.accountType')}>
					<div className="fts-plan-row">
						<div className={`fts-plan-card ${isPro ? 'fts-plan-card--active' : ''}`}>
							<div className="fts-plan-card__title">{t('settings.account.proTechnician')}</div>
							<div className="fts-plan-card__sub">{t('settings.account.proSub')}</div>
						</div>
						<div className="fts-plan-card fts-plan-card--disabled">
							<div className="fts-plan-card__title">{t('settings.account.enterprise')}</div>
							<div className="fts-plan-card__sub">{t('settings.account.enterpriseSub')}</div>
						</div>
					</div>
				</SettingsField>

				<SettingsSaveButton onClick={onSave} loading={saving} label={t('settings.saveChanges')} />
			</div>
		</div>
	);
};

export default AccountSettingsSection;
