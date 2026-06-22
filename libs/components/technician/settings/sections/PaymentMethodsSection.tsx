import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import SettingsSectionHead from '../SettingsSectionHead';
import SettingsField from '../SettingsField';
import SettingsSaveButton from '../SettingsSaveButton';
import {
	CREATE_PAYMENT_METHOD,
	DELETE_PAYMENT_METHOD,
	GET_PAYMENT_METHODS,
	UPDATE_PAYMENT_METHOD,
} from '../../../../../apollo/user/settings';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../../sweetAlert';

const PaymentMethodsSection: React.FC = () => {
	const { t } = useTranslation('technician');
	const { data, loading, refetch } = useQuery(GET_PAYMENT_METHODS, { fetchPolicy: 'network-only' });
	const [createMethod, { loading: creating }] = useMutation(CREATE_PAYMENT_METHOD);
	const [updateMethod] = useMutation(UPDATE_PAYMENT_METHOD);
	const [deleteMethod] = useMutation(DELETE_PAYMENT_METHOD);

	const [methodLabel, setMethodLabel] = useState('');
	const [methodType, setMethodType] = useState('KAKAOPAY');
	const [maskedNumber, setMaskedNumber] = useState('');

	const methods = data?.getPaymentMethods?.list ?? [];

	const handleAdd = async () => {
		if (!methodLabel.trim()) return;
		try {
			await createMethod({
				variables: {
					input: {
						methodLabel: methodLabel.trim(),
						methodType,
						maskedNumber: maskedNumber.trim() || undefined,
						isPrimary: methods.length === 0,
					},
				},
			});
			setMethodLabel('');
			setMaskedNumber('');
			await refetch();
			await sweetTopSmallSuccessAlert(t('settings.payment.added'), 1200);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const setPrimary = async (paymentMethodId: string) => {
		try {
			await updateMethod({ variables: { input: { paymentMethodId, isPrimary: true } } });
			await refetch();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const remove = async (paymentMethodId: string) => {
		try {
			await deleteMethod({ variables: { paymentMethodId } });
			await refetch();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<div className="fts-section">
			<SettingsSectionHead title={t('settings.payment.title')} desc={t('settings.payment.desc')} />

			<div className="fts-card fts-card--spaced">
				<h3 className="fts-card__title">{t('settings.payment.savedMethods')}</h3>
				{loading && !methods.length ? (
					<p className="fts-hint">{t('settings.loading')}</p>
				) : !methods.length ? (
					<p className="fts-hint">{t('settings.payment.empty')}</p>
				) : (
					methods.map((method: any) => (
						<div key={method._id} className="fts-payment-row">
							<div>
								<strong>{method.methodLabel}</strong>
								<div className="fts-hint fts-hint--muted">
									{method.methodType}
									{method.maskedNumber ? ` · ${method.maskedNumber}` : ''}
									{method.isPrimary ? ` · ${t('settings.payment.primary')}` : ''}
								</div>
							</div>
							<div className="fts-payment-row__actions">
								{!method.isPrimary && (
									<button type="button" className="fts-avatar-block__link" onClick={() => setPrimary(method._id)}>
										{t('settings.payment.makePrimary')}
									</button>
								)}
								<button type="button" className="fts-avatar-block__link fts-avatar-block__link--danger" onClick={() => remove(method._id)}>
									<DeleteOutlineOutlined style={{ fontSize: 14 }} />
								</button>
							</div>
						</div>
					))
				)}
			</div>

			<div className="fts-card">
				<h3 className="fts-card__title">{t('settings.payment.addMethod')}</h3>
				<SettingsField label={t('settings.payment.label')}>
					<input className="fts-input" value={methodLabel} onChange={(e) => setMethodLabel(e.target.value)} />
				</SettingsField>
				<SettingsField label={t('settings.payment.type')}>
					<select className="fts-select" value={methodType} onChange={(e) => setMethodType(e.target.value)}>
						<option value="KAKAOPAY">KakaoPay</option>
						<option value="CARD">{t('settings.payment.typeCard')}</option>
						<option value="CASH">{t('settings.payment.typeCash')}</option>
					</select>
				</SettingsField>
				<SettingsField label={t('settings.payment.masked')}>
					<input className="fts-input" value={maskedNumber} onChange={(e) => setMaskedNumber(e.target.value)} placeholder="****-1234" />
				</SettingsField>
				<SettingsSaveButton onClick={handleAdd} loading={creating} label={t('settings.payment.addButton')} />
			</div>
		</div>
	);
};

export default PaymentMethodsSection;
