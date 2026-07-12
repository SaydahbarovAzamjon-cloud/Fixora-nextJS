import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { isPostSignupOnboardingIncomplete } from '../../auth/postSignupOnboarding';
import { getPostSignupOnboardingPath } from '../../utils/postAuthDestination';
import { resolveAuthUser } from '../../utils/authSession';

const OnboardingReminderBanner = () => {
	const { t } = useTranslation('auth');
	const router = useRouter();
	const authUser = resolveAuthUser();
	const userId = authUser?._id;

	if (!userId || !isPostSignupOnboardingIncomplete(userId)) {
		return null;
	}

	return (
		<div className="auth-onboarding-reminder" role="status">
			<InfoOutlinedIcon fontSize="small" />
			<div className="auth-onboarding-reminder__text">
				<strong>{t('onboarding.reminderTitle')}</strong>
				<p>{t('onboarding.reminderBody')}</p>
			</div>
			<button
				type="button"
				className="auth-onboarding-reminder__cta"
				onClick={() => void router.push(getPostSignupOnboardingPath(authUser))}
			>
				{t('onboarding.reminderCta')}
			</button>
		</div>
	);
};

export default OnboardingReminderBanner;
