import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import dynamic from 'next/dynamic';

import { useMutation } from '@apollo/client';

import { useRouter } from 'next/router';

import { useTranslation } from 'next-i18next';

import ArrowForward from '@mui/icons-material/ArrowForward';

import AddAPhotoOutlined from '@mui/icons-material/AddAPhotoOutlined';

import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';

import { FixoraButton, FixoraInput } from '../ui';

import AuthHeading from '../auth/AuthHeading';

import DeviceCategoryPicker from './DeviceCategoryPicker';

import { SUBMIT_TECHNICIAN_VERIFICATION } from '../../../apollo/user/auth';

import { UPDATE_TECHNICIAN_SETTINGS } from '../../../apollo/user/settings';

import { userVar } from '../../../apollo/store';

import { getJwtToken } from '../../auth/tokens';

import {

	markPostSignupOnboardingCompleted,

	markPostSignupOnboardingSkipped,

} from '../../auth/postSignupOnboarding';

import { mergeTechnicianSettingsCache } from '../../auth/technicianSettingsCache';

import { syncUserVarFromGraphqlUser } from '../../auth/syncUserVar';

import { uploadImageFile } from '../../utils/uploadImageFile';

import { getTechnicianAfterOnboardingPath } from '../../utils/postAuthDestination';

import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';

import {

	SETTINGS_DAYS,

	SETTINGS_HOURS,

	createDefaultAvailabilityDays,

} from '../../hooks/useTechnicianSettings';

import { formatTechnicianSpecialtyField } from '../../utils/technicianDeviceCategory';

import { hasRealProfileImage, resolveProfileImageUrl } from '../../utils/profileImage';

import type { DeviceCategory, UserServiceItem } from '../../types/fixora/fixora';
import type { MapPoint } from '../../kakao-maps';



const KakaoLocationPicker = dynamic(() => import('../location/KakaoLocationPicker'), { ssr: false });



const emptyService = (): UserServiceItem => ({ title: '', basePrice: 0 });



const TechnicianOnboardingForm = () => {

	const { t } = useTranslation('auth');

	const router = useRouter();

	const user = userVar();

	const idRef = useRef<HTMLInputElement>(null);

	const portfolioRef = useRef<HTMLInputElement>(null);



	const [shopName, setShopName] = useState('');

	const [bio, setBio] = useState('');

	const [deviceCategories, setDeviceCategories] = useState<DeviceCategory[]>([]);

	const [yearsExperience, setYearsExperience] = useState('');

	const [location, setLocation] = useState('');

	const [shopLatitude, setShopLatitude] = useState<number | null>(null);

	const [shopLongitude, setShopLongitude] = useState<number | null>(null);

	const [certificationsText, setCertificationsText] = useState('');

	const [services, setServices] = useState<UserServiceItem[]>([emptyService()]);

	const [days, setDays] = useState<Record<string, boolean>>(createDefaultAvailabilityDays());

	const [startTime, setStartTime] = useState('9:00 AM');

	const [endTime, setEndTime] = useState('6:00 PM');

	const [photoFile, setPhotoFile] = useState<File | null>(null);

	const [photoPreview, setPhotoPreview] = useState<string | null>(null);

	const [idFile, setIdFile] = useState<File | null>(null);

	const [idFileName, setIdFileName] = useState('');

	const [idFilePreview, setIdFilePreview] = useState<string | null>(null);

	const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);

	const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);



	const [updateUser, { loading }] = useMutation(UPDATE_TECHNICIAN_SETTINGS);

	const [submitVerification] = useMutation(SUBMIT_TECHNICIAN_VERIFICATION);



	const locationPoint = useMemo<MapPoint | null>(() => {

		if (shopLatitude == null || shopLongitude == null) return null;

		return { lat: shopLatitude, lng: shopLongitude };

	}, [shopLatitude, shopLongitude]);



	useEffect(() => {

		const existingImage = user.memberImage;

		if (!hasRealProfileImage(existingImage) || photoPreview) return;

		setPhotoPreview(resolveProfileImageUrl(existingImage));

	}, [photoPreview, user.memberImage]);



	useEffect(() => {

		return () => {

			if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview);

			if (idFilePreview) URL.revokeObjectURL(idFilePreview);

			portfolioPreviews.forEach((url) => {

				if (url.startsWith('blob:')) URL.revokeObjectURL(url);

			});

		};

	}, [idFilePreview, photoPreview, portfolioPreviews]);



	const toggleDay = (day: string) => {

		setDays((prev) => ({ ...prev, [day]: !prev[day] }));

	};



	const handleIdFile = (file: File | undefined) => {

		if (!file) return;

		setIdFile(file);

		setIdFileName(file.name);

		setIdFilePreview((prev) => {

			if (prev) URL.revokeObjectURL(prev);

			if (file.type.startsWith('image/')) return URL.createObjectURL(file);

			return null;

		});

	};



	const handlePortfolioFiles = (files: File[]) => {

		if (!files.length) return;

		const nextFiles = [...portfolioFiles, ...files].slice(0, 5);

		setPortfolioFiles(nextFiles);

		setPortfolioPreviews((prev) => {

			prev.forEach((url) => {

				if (url.startsWith('blob:')) URL.revokeObjectURL(url);

			});

			return nextFiles.map((file) => URL.createObjectURL(file));

		});

	};



	const finish = useCallback(

		async (skipped: boolean) => {

			const userId = user._id;

			if (!userId) return;



			if (skipped) {

				markPostSignupOnboardingSkipped(userId);

				await router.push(getTechnicianAfterOnboardingPath(userVar()));

				return;

			}



			try {

				const token = getJwtToken();

				if (!token) {

					await router.replace('/login');

					return;

				}



				let profileImagePath: string | undefined;

				if (photoFile) {

					profileImagePath = await uploadImageFile(photoFile, token);

				}



				const verificationDocuments: string[] = [];

				if (idFile) {

					verificationDocuments.push(await uploadImageFile(idFile, token));

				}



				const portfolioImages: string[] = [];

				for (const file of portfolioFiles.slice(0, 5)) {

					portfolioImages.push(await uploadImageFile(file, token));

				}



				const certifications = certificationsText

					.split(/[\n,]/)

					.map((s) => s.trim())

					.filter(Boolean);



				const serviceItems = services

					.filter((s) => s.title.trim())

					.map((s) => ({

						title: s.title.trim(),

						basePrice: Number.isFinite(s.basePrice) ? s.basePrice : 0,

					}));



				const selectedDays = SETTINGS_DAYS.filter((d) => days[d]);

				const specialtyValue = formatTechnicianSpecialtyField(deviceCategories);



				const input: Record<string, unknown> = {

					_id: userId,

					...(shopName.trim() ? { shopName: shopName.trim() } : {}),

					...(bio.trim() ? { userBio: bio.trim() } : {}),

					...(specialtyValue ? { specialty: specialtyValue } : {}),

					...(location.trim() ? { userLocation: location.trim() } : {}),

					...(profileImagePath ? { userProfileImage: profileImagePath } : {}),

					...(verificationDocuments.length ? { verificationDocuments } : {}),

					...(portfolioImages.length ? { portfolioImages } : {}),

					...(certifications.length ? { certifications } : {}),

					...(serviceItems.length ? { services: serviceItems } : {}),

					...(yearsExperience.trim() && !Number.isNaN(Number(yearsExperience))

						? { yearsExperience: Math.max(0, Math.floor(Number(yearsExperience))) }

						: {}),

					...(shopLatitude != null && shopLongitude != null

						? { shopLatitude, shopLongitude }

						: {}),

					workingHours: {

						days: selectedDays,

						startTime,

						endTime,

					},

				};



				const { data } = await updateUser({ variables: { input } });

				const saved = data?.updateUser;

				syncUserVarFromGraphqlUser({

					_id: userId,

					userBio: saved?.userBio ?? bio,

					userProfileImage: saved?.userProfileImage ?? profileImagePath ?? null,

				});

				mergeTechnicianSettingsCache(userId, {

					shopName: shopName.trim() || null,

					userBio: bio.trim() || null,

					userLocation: location.trim() || null,

					specialty: specialtyValue || null,

					services: serviceItems,

					userProfileImage: saved?.userProfileImage ?? profileImagePath ?? null,

					shopLatitude,

					shopLongitude,

					workingHours: {

						days: selectedDays,

						startTime,

						endTime,

					},

				});



				if (verificationDocuments.length > 0) {

					try {

						await submitVerification({ fetchPolicy: 'network-only' });

					} catch {

						// PENDING without submit is still reviewable (GAP-110)

					}

				}



				markPostSignupOnboardingCompleted(userId);

				await sweetTopSmallSuccessAlert(t('onboarding.saved'), 800);

				await router.push(getTechnicianAfterOnboardingPath(userVar()));

			} catch (err) {

				await sweetErrorHandling(err);

			}

		},

		[

			bio,

			certificationsText,

			days,

			deviceCategories,

			endTime,

			idFile,

			location,

			photoFile,

			portfolioFiles,

			router,

			services,

			shopLatitude,

			shopLongitude,

			shopName,

			startTime,

			submitVerification,

			t,

			updateUser,

			user._id,

			yearsExperience,

		],

	);



	return (

		<>

			<AuthHeading

				titleBefore={t('onboarding.technician.titleBefore')}

				titleAccent={t('onboarding.technician.titleAccent')}

				subtitle={t('onboarding.technician.subtitle')}

			/>

			<div className="auth-tech">

				<input

					type="file"

					accept="image/*"

					hidden

					id="tech-onboarding-photo"

					onChange={(e) => {

						const file = e.target.files?.[0];

						if (!file?.type.startsWith('image/')) return;

						setPhotoFile(file);

						setPhotoPreview((prev) => {

							if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);

							return URL.createObjectURL(file);

						});

					}}

				/>

				<label htmlFor="tech-onboarding-photo" className="auth-tech__photo auth-tech__photo--button">

					{photoPreview ? (

						<img src={photoPreview} alt="" className="auth-tech__photo-preview" />

					) : (

						<>

							<AddAPhotoOutlined />

							<span>{t('onboarding.technician.photo')}</span>

						</>

					)}

				</label>



				<div className="auth-form">

					<FixoraInput

						label={t('onboarding.technician.shopName')}

						value={shopName}

						onChange={(e) => setShopName(e.target.value)}

						placeholder={t('onboarding.technician.shopNamePlaceholder')}

					/>

					<DeviceCategoryPicker

						label={t('onboarding.technician.specializations')}

						hint={t('onboarding.technician.specializationsDesc')}

						emptyHint={t('onboarding.technician.specializationsHint')}

						value={deviceCategories}

						onChange={setDeviceCategories}

					/>

					<FixoraInput

						label={t('onboarding.technician.yearsExperience')}

						type="number"

						min={0}

						value={yearsExperience}

						onChange={(e) => setYearsExperience(e.target.value)}

						placeholder="0"

					/>

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

						<label className="fixora-input__label" htmlFor="tech-onboarding-bio">

							{t('onboarding.technician.bio')}

						</label>

						<div className="fixora-input__field fixora-input__field--textarea">

							<textarea

								id="tech-onboarding-bio"

								className="fixora-input__control"

								rows={3}

								value={bio}

								onChange={(e) => setBio(e.target.value)}

								placeholder={t('onboarding.technician.bioPlaceholder')}

							/>

						</div>

					</div>

					<div className="fixora-input">

						<label className="fixora-input__label" htmlFor="tech-onboarding-certs">

							{t('onboarding.technician.certifications')}

						</label>

						<div className="fixora-input__field fixora-input__field--textarea">

							<textarea

								id="tech-onboarding-certs"

								className="fixora-input__control"

								rows={2}

								value={certificationsText}

								onChange={(e) => setCertificationsText(e.target.value)}

								placeholder={t('onboarding.technician.certificationsPlaceholder')}

							/>

						</div>

					</div>



					<p className="auth-form__hint">{t('onboarding.technician.services')}</p>

					{services.map((service, index) => (

						<div key={`service-${index}`} className="auth-form__row auth-form__row--2">

							<FixoraInput

								label={t('onboarding.technician.serviceTitle')}

								value={service.title}

								onChange={(e) => {

									const next = [...services];

									next[index] = { ...next[index], title: e.target.value };

									setServices(next);

								}}

							/>

							<FixoraInput

								label={t('onboarding.technician.servicePrice')}

								type="number"

								min={0}

								value={service.basePrice ? String(service.basePrice) : ''}

								onChange={(e) => {

									const next = [...services];

									next[index] = { ...next[index], basePrice: Number(e.target.value) || 0 };

									setServices(next);

								}}

							/>

						</div>

					))}

					{services.length < 5 && (

						<button

							type="button"

							className="auth-form__link"

							onClick={() => setServices((prev) => [...prev, emptyService()])}

						>

							{t('onboarding.technician.addService')}

						</button>

					)}



					<p className="auth-form__hint">{t('onboarding.technician.workingHours')}</p>

					<div className="auth-onboarding-days">

						{SETTINGS_DAYS.map((day) => (

							<button

								key={day}

								type="button"

								className={`auth-onboarding-days__pill${days[day] ? ' auth-onboarding-days__pill--active' : ''}`}

								onClick={() => toggleDay(day)}

							>

								{day}

							</button>

						))}

					</div>

					<div className="auth-form__row auth-form__row--2">

						<div className="fixora-input">

							<label className="fixora-input__label" htmlFor="tech-onboarding-start">

								{t('onboarding.technician.startTime')}

							</label>

							<div className="fixora-input__field">

								<select

									id="tech-onboarding-start"

									className="fixora-input__control"

									value={startTime}

									onChange={(e) => setStartTime(e.target.value)}

								>

									{SETTINGS_HOURS.map((h) => (

										<option key={h} value={h}>

											{h}

										</option>

									))}

								</select>

							</div>

						</div>

						<div className="fixora-input">

							<label className="fixora-input__label" htmlFor="tech-onboarding-end">

								{t('onboarding.technician.endTime')}

							</label>

							<div className="fixora-input__field">

								<select

									id="tech-onboarding-end"

									className="fixora-input__control"

									value={endTime}

									onChange={(e) => setEndTime(e.target.value)}

								>

									{SETTINGS_HOURS.map((h) => (

										<option key={h} value={h}>

											{h}

										</option>

									))}

								</select>

							</div>

						</div>

					</div>



					<input

						ref={portfolioRef}

						type="file"

						accept="image/*"

						multiple

						hidden

						onChange={(e) => {

							const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'));

							handlePortfolioFiles(files);

						}}

					/>

					<div className="auth-onboarding-portfolio">

						<button

							type="button"

							className="auth-tech__upload auth-tech__upload--compact"

							onClick={() => portfolioRef.current?.click()}

						>

							<CloudUploadOutlined />

							<span>{t('onboarding.technician.portfolio')}</span>

							{portfolioFiles.length > 0 && (

								<small>{t('onboarding.technician.portfolioCount', { count: portfolioFiles.length })}</small>

							)}

						</button>

						{portfolioPreviews.length > 0 && (

							<div className="auth-onboarding-portfolio__thumbs">

								{portfolioPreviews.map((src, index) => (

									<img key={`${src}-${index}`} src={src} alt="" className="auth-onboarding-portfolio__thumb" />

								))}

							</div>

						)}

					</div>



					<input

						ref={idRef}

						type="file"

						accept="image/*,.pdf"

						hidden

						onChange={(e) => handleIdFile(e.target.files?.[0])}

					/>

					<div

						className={`auth-tech__upload auth-tech__upload--id${idFilePreview ? ' auth-tech__upload--has-image' : ''}`}

						role="button"

						tabIndex={0}

						onClick={() => idRef.current?.click()}

						onKeyDown={(e) => e.key === 'Enter' && idRef.current?.click()}

					>

						{idFilePreview ? (

							<img src={idFilePreview} alt="" className="auth-tech__upload-preview" />

						) : (

							<>

								<CloudUploadOutlined />

								<strong>{t('onboarding.technician.idUpload')}</strong>

								<span>{idFileName || t('tech.idHint')}</span>

							</>

						)}

					</div>

					{idFileName && !idFilePreview && <p className="auth-tech__file-name">{idFileName}</p>}



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



export default TechnicianOnboardingForm;


