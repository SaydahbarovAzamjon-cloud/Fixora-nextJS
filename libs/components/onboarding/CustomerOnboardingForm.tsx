import React, { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import ArrowForward from '@mui/icons-material/ArrowForward';
import AddAPhotoOutlined from '@mui/icons-material/AddAPhotoOutlined';
import { FixoraButton } from '../ui';
import AuthHeading from '../auth/AuthHeading';
import { UPDATE_USER } from '../../../apollo/user/profile';
import { userVar } from '../../../apollo/store';
import { getJwtToken } from '../../auth/tokens';
import {
	markPostSignupOnboardingCompleted,
	markPostSignupOnboardingSkipped,
} from '../../auth/postSignupOnboarding';
import { syncUserVarFromGraphqlUser } from '../../auth/syncUserVar';
import { uploadImageFile } from '../../utils/uploadImageFile';
import { resolvePostAuthDestination } from '../../utils/postAuthDestination';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import type { MapPoint } from '../../kakao-maps';

const KakaoLocationPicker = dynamic(() => import('../location/KakaoLocationPicker'), { ssr: false });

const CustomerOnboardingForm = () => {
	const { t } = useTranslation('auth');
	const router = useRouter();
	const user = userVar();
	const [location, setLocation] = useState(user.memberAddress ?? '');
	const [bio, setBio] = useState('');
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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
				const token = getJwtToken();
				let profileImagePath: string | undefined;
				if (photoFile && token) {
					profileImagePath = await uploadImageFile(photoFile, token);
				}

				const input: Record<string, unknown> = {
					_id: userId,
					...(location.trim() ? { userLocation: location.trim() } : {}),
					...(bio.trim() ? { userBio: bio.trim() } : {}),
					...(profileImagePath ? { userProfileImage: profileImagePath } : {}),
				};

				const { data } = await updateUser({ variables: { input } });
				const saved = data?.updateUser;
				syncUserVarFromGraphqlUser({
					_id: userId,
					userLocation: saved?.userLocation ?? location,
					userBio: saved?.userBio ?? bio,
					userProfileImage: saved?.userProfileImage ?? profileImagePath ?? null,
				});
				markPostSignupOnboardingCompleted(userId);
				await sweetTopSmallSuccessAlert(t('onboarding.saved'), 800);
				await router.push(resolvePostAuthDestination(userVar()));
			} catch (err) {
				await sweetErrorHandling(err);
			}
		},
		[bio, location, photoFile, router, t, updateUser, user._id],
	);

	return (
		<>
			<AuthHeading
				titleBefore={t('onboarding.customer.titleBefore')}
				titleAccent={t('onboarding.customer.titleAccent')}
				subtitle={t('onboarding.customer.subtitle')}
			/>
			<div className="auth-tech">
				<input
					type="file"
					accept="image/*"
					hidden
					id="customer-onboarding-photo"
					onChange={(e) => {
						const file = e.target.files?.[0];
						if (!file?.type.startsWith('image/')) return;
						setPhotoFile(file);
						setPhotoPreview((prev) => {
							if (prev) URL.revokeObjectURL(prev);
							return URL.createObjectURL(file);
						});
					}}
				/>
				<label htmlFor="customer-onboarding-photo" className="auth-tech__photo auth-tech__photo--button">
					{photoPreview ? (
						<img src={photoPreview} alt="" className="auth-tech__photo-preview" />
					) : (
						<>
							<AddAPhotoOutlined />
							<span>{t('onboarding.customer.photo')}</span>
						</>
					)}
				</label>
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
