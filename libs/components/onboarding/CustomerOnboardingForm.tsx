import React, { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { FixoraButton } from '../ui';
import AuthHeading from '../auth/AuthHeading';
import { UPDATE_USER } from '../../../apollo/user/profile';
import { userVar } from '../../../apollo/store';
import {
	markPostSignupOnboardingCompleted,
	markPostSignupOnboardingSkipped,
} from '../../auth/postSignupOnboarding';
import { syncUserVarFromGraphqlUser } from '../../auth/syncUserVar';
import { resolvePostAuthDestination } from '../../utils/postAuthDestination';
import { writeHomepageNearbyPoint } from '../../utils/homepageNearbyStorage';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import type { MapPoint } from '../../kakao-maps';

const KakaoLocationPicker = dynamic(() => import('../location/KakaoLocationPicker'), { ssr: false });

const CustomerOnboardingForm = () => {
	const { t } = useTranslation('auth');
	const router = useRouter();
	const user = userVar();
	const [location, setLocation] = useState(user.memberAddress ?? '');
	const [bio, setBio] = useState('');
	const [shopLatitude, setShopLatitude] = useState<number | null>(null);
	const [shopLongitude, setShopLongitude] = useState<number | null>(null);
	const [updateUser, { loading }] = useMutation(UPDATE_USER);

	const locationPoint = useMemo<MapPoint | null>(() => {
		if (shopLatitude == null || shopLongitude == null) return null;
		return { lat: shopLatitude, lng: shopLongitude };
	}, [shopLatitude, shopLongitude]);

	const finish = useCallback(
		async (skipped: boolean) => {
			const userId = user._id;
			if (!userId) return;

			if (skipped) {
				markPostSignupOnboardingSkipped(userId);
				await router.push(resolvePostAuthDestination(userVar()));
				return;
			}

			try {
				const input: Record<string, unknown> = {
					_id: userId,
					...(location.trim() ? { userLocation: location.trim() } : {}),
					...(bio.trim() ? { userBio: bio.trim() } : {}),
				};

				const { data } = await updateUser({ variables: { input } });
				const saved = data?.updateUser;
				syncUserVarFromGraphqlUser({
					_id: userId,
					userLocation: saved?.userLocation ?? location,
					userBio: saved?.userBio ?? bio,
				});
				if (shopLatitude != null && shopLongitude != null) {
					writeHomepageNearbyPoint(userId, {
						lat: shopLatitude,
						lng: shopLongitude,
						label: location.trim() || undefined,
					});
				}
				markPostSignupOnboardingCompleted(userId);
				await sweetTopSmallSuccessAlert(t('onboarding.saved'), 800);
				await router.push(resolvePostAuthDestination(userVar()));
			} catch (err) {
				await sweetErrorHandling(err);
			}
		},
		[bio, location, router, shopLatitude, shopLongitude, t, updateUser, user._id],
	);

	return (
		<>
			<AuthHeading
				titleBefore={t('onboarding.customer.titleBefore')}
				titleAccent={t('onboarding.customer.titleAccent')}
				subtitle={t('onboarding.customer.subtitle')}
			/>
			<div className="auth-tech">
				<div className="auth-form">
					<KakaoLocationPicker
						value={location}
						onChange={setLocation}
						onPointChange={(point) => {
							setShopLatitude(point?.lat ?? null);
							setShopLongitude(point?.lng ?? null);
						}}
						initialPoint={locationPoint}
					/>
					<div className="fixora-input">
						<label className="fixora-input__label" htmlFor="customer-onboarding-bio">
							{t('onboarding.customer.bio')}
						</label>
						<div className="fixora-input__field fixora-input__field--textarea">
							<textarea
								id="customer-onboarding-bio"
								className="fixora-input__control"
								rows={3}
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								placeholder={t('onboarding.customer.bioPlaceholder')}
							/>
						</div>
					</div>
					<FixoraButton variant="primary" fullWidth disabled={loading} onClick={() => finish(false)}>
						{t('onboarding.complete')}
						<ArrowForward fontSize="small" />
					</FixoraButton>
					<button type="button" className="auth-form__link auth-form__link--center" onClick={() => finish(true)}>
						{t('onboarding.skip')}
					</button>
				</div>
			</div>
		</>
	);
};

export default CustomerOnboardingForm;
