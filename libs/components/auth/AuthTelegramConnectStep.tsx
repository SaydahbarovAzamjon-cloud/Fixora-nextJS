import React, { useCallback, useState } from 'react';
import { useTranslation } from 'next-i18next';
import TelegramIcon from '@mui/icons-material/Telegram';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import { FixoraButton } from '../ui';
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences';
import { isNetworkFetchError } from '../../utils/oauthErrors';
import { sweetErrorHandling } from '../../sweetAlert';

interface AuthTelegramConnectStepProps {
	/** Called when user finishes (connected or skips). Ignored when `embedded`. */
	onContinue?: () => void;
	/**
	 * Embed under signup fields (after notification prefs).
	 * Hides Skip/Continue — parent keeps its own submit / next CTA.
	 */
	embedded?: boolean;
}

/**
 * Connect Telegram — requires Bearer session (OAuth stub or post-signup).
 */
const AuthTelegramConnectStep = ({ onContinue, embedded = false }: AuthTelegramConnectStepProps) => {
	const { t } = useTranslation('auth');
	const {
		preferences,
		loading,
		linking,
		polling,
		connectTelegram,
		error,
	} = useNotificationPreferences();

	const [connectError, setConnectError] = useState<string | null>(null);

	const status = preferences?.telegramStatus ?? 'NOT_CONNECTED';
	const linked = status === 'LINKED';
	const username = preferences?.telegramUsername?.replace(/^@/, '');

	const handleConnect = useCallback(async () => {
		setConnectError(null);
		try {
			const url = await connectTelegram();
			if (!url) {
				setConnectError(t('authTelegram.linkFailed'));
			}
		} catch (err) {
			const msg = isNetworkFetchError(err)
				? t('authTelegram.networkError')
				: t('authTelegram.linkFailed');
			setConnectError(msg);
			await sweetErrorHandling({ message: msg });
		}
	}, [connectTelegram, t]);

	return (
		<div className={`auth-telegram-step${embedded ? ' auth-telegram-step--embedded' : ''}`}>
			<div className="auth-telegram-step__head">
				<TelegramIcon />
				<strong>{t('authTelegram.title')}</strong>
			</div>
			<p className="auth-telegram-step__desc">{t('authTelegram.desc')}</p>

			{loading && !preferences ? (
				<p className="auth-telegram-step__status">{t('authTelegram.loading')}</p>
			) : linked ? (
				<div className="auth-telegram-step__success" role="status">
					<CheckCircleOutline fontSize="small" />
					<span>
						{t('authTelegram.connected')}
						{username ? ` · @${username}` : ''}
					</span>
				</div>
			) : (
				<>
					<p className="auth-telegram-step__status">
						{polling
							? t('authTelegram.waiting')
							: t(`authTelegram.status.${status === 'PENDING' ? 'pending' : 'notConnected'}`)}
					</p>
					{(connectError || error) && (
						<p className="auth-telegram-step__error" role="alert">
							{connectError || error?.message}
						</p>
					)}
					<FixoraButton
						variant={embedded ? 'secondary' : 'primary'}
						fullWidth
						disabled={linking || polling}
						onClick={() => void handleConnect()}
					>
						{linking
							? t('authTelegram.connecting')
							: polling
								? t('authTelegram.waitingShort')
								: t('authTelegram.connect')}
					</FixoraButton>
				</>
			)}

			{!embedded && onContinue && (
				<div className="auth-telegram-step__actions">
					<button type="button" className="auth-form__link" onClick={onContinue}>
						{linked ? t('authTelegram.continue') : t('authTelegram.skip')}
					</button>
				</div>
			)}
		</div>
	);
};

export default AuthTelegramConnectStep;
