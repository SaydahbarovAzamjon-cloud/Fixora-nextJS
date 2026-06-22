import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation } from '@apollo/client';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import SettingsSectionHead from '../SettingsSectionHead';
import { DELETE_ACCOUNT } from '../../../../../apollo/user/settings';
import { logOut } from '../../../../auth';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../../sweetAlert';

const CONFIRM_PHRASE = 'DELETE';

const DeleteAccountSection: React.FC = () => {
	const { t } = useTranslation('technician');
	const [confirmText, setConfirmText] = useState('');
	const [deleteAccount, { loading }] = useMutation(DELETE_ACCOUNT);

	const canDelete = confirmText.trim() === CONFIRM_PHRASE;

	const handleDelete = async () => {
		if (!canDelete) return;
		const confirmed = await sweetConfirmAlert(t('settings.delete.confirmPrompt'));
		if (!confirmed) return;

		try {
			await deleteAccount({ variables: { input: { confirmation: CONFIRM_PHRASE } } });
			logOut();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<div className="fts-section">
			<SettingsSectionHead title={t('settings.delete.title')} desc={t('settings.delete.desc')} />

			<div className="fts-danger-card">
				<div className="fts-danger-card__head">
					<WarningAmberOutlined style={{ fontSize: 18, color: '#EF4444' }} />
					<span>{t('settings.delete.dangerZone')}</span>
				</div>
				<p className="fts-danger-card__text">{t('settings.delete.warning')}</p>

				<label className="fts-field__label">{t('settings.delete.confirmLabel')}</label>
				<input
					className="fts-input fts-input--danger"
					value={confirmText}
					onChange={(e) => setConfirmText(e.target.value)}
					placeholder={CONFIRM_PHRASE}
				/>

				<button
					type="button"
					className="fts-danger-btn"
					disabled={!canDelete || loading}
					onClick={handleDelete}
				>
					<DeleteOutlineOutlined style={{ fontSize: 14 }} />
					{t('settings.delete.submit')}
				</button>
			</div>
		</div>
	);
};

export default DeleteAccountSection;
