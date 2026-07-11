import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import { UPDATE_USER } from '../../../../apollo/user/profile';
import { syncUserVarFromGraphqlUser } from '../../../auth/syncUserVar';
import type { MapPoint } from '../../../kakao-maps';
import { FixoraButton, FixoraInput } from '../../ui';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../sweetAlert';

const LocationPickerSkeleton = () => (
	<div className="fixora-mypage__location-picker fixora-mypage__location-picker--loading" aria-hidden="true">
		<div className="fixora-mypage__location-picker-search" />
		<div className="fixora-mypage__location-picker-map" />
	</div>
);

const NearbyTechniciansSkeleton = () => (
	<aside className="fixora-mypage__nearby-techs fixora-mypage__nearby-techs--loading" aria-hidden="true" />
);

const KakaoLocationPicker = dynamic(() => import('../../location/KakaoLocationPicker'), {
	ssr: false,
	loading: LocationPickerSkeleton,
});
const NearbyTechniciansPreview = dynamic(() => import('../../location/NearbyTechniciansPreview'), {
	ssr: false,
	loading: NearbyTechniciansSkeleton,
});

export interface SettingsTabProps {
	userId: string;
	userFullName?: string;
	userNickname?: string;
	userLocation?: string;
	userBio?: string;
	mode?: 'full' | 'location';
	onOpenPhotoPicker?: () => void;
	photoUploading?: boolean;
	uploadPendingPhoto?: () => Promise<void>;
}

const SettingsTab = ({
	userId,
	userFullName,
	userNickname,
	userLocation,
	userBio,
	mode = 'full',
	onOpenPhotoPicker,
	photoUploading = false,
	uploadPendingPhoto,
}: SettingsTabProps) => {
	const { t } = useTranslation('common');
	const [fullName, setFullName] = useState(userFullName ?? '');
	const [nickname, setNickname] = useState(userNickname ?? '');
	const [location, setLocation] = useState(userLocation ?? '');
	const [locationPoint, setLocationPoint] = useState<MapPoint | null>(null);
	const [bio, setBio] = useState(userBio ?? '');

	const [updateUser, { loading }] = useMutation(UPDATE_USER);

	const save = async () => {
		try {
			if (uploadPendingPhoto) {
				await uploadPendingPhoto();
			}
			const { data } = await updateUser({
				variables: {
					input: {
						_id: userId,
						...(mode === 'location'
							? { userLocation: location }
							: {
									userFullName: fullName,
									userNickname: nickname,
									userLocation: location,
									userBio: bio,
								}),
					},
				},
			});
			const saved = data?.updateUser;
			syncUserVarFromGraphqlUser({
				_id: userId,
				userFullName: saved?.userFullName ?? (mode === 'full' ? fullName : undefined),
				userNickname: saved?.userNickname ?? (mode === 'full' ? nickname : undefined),
				userLocation: saved?.userLocation ?? location,
				userBio: saved?.userBio ?? (mode === 'full' ? bio : undefined),
			});
			await sweetTopSmallSuccessAlert(t('mypage.settings.saved'), 800);
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<div className={`fixora-mypage__settings${mode === 'location' ? ' fixora-mypage__settings--location' : ''}`}>
			{mode === 'location' ? (
				<div className="fixora-mypage__location-layout">
					<div className="fixora-mypage__location-layout-picker">
						<KakaoLocationPicker
							label={t('mypage.settings.location')}
							value={location}
							onChange={setLocation}
							onPointChange={setLocationPoint}
						/>
						<FixoraButton onClick={save} disabled={loading || photoUploading}>
							{t('mypage.settings.save')}
						</FixoraButton>
					</div>
					<NearbyTechniciansPreview point={locationPoint} />
				</div>
			) : (
				<>
			{mode === 'full' && onOpenPhotoPicker && (
				<div className="fixora-mypage__settings-photo">
					<FixoraButton variant="outline" onClick={onOpenPhotoPicker} disabled={photoUploading || loading}>
						<PhotoCameraOutlinedIcon fontSize="small" />
						{t('mypage.settings.uploadPhoto')}
					</FixoraButton>
				</div>
			)}
			{mode === 'full' && (
				<>
					<FixoraInput
						label={t('mypage.settings.fullName')}
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
					/>
					<FixoraInput
						label={t('mypage.settings.nickname')}
						value={nickname}
						onChange={(e) => setNickname(e.target.value)}
					/>
				</>
			)}
			<KakaoLocationPicker
				label={t('mypage.settings.location')}
				value={location}
				onChange={setLocation}
			/>
			{mode === 'full' && (
				<div className="fixora-input">
					<label className="fixora-input__label" htmlFor="mypage-bio">
						{t('mypage.settings.bio')}
					</label>
					<div className="fixora-input__field fixora-input__field--textarea">
						<textarea
							id="mypage-bio"
							className="fixora-input__control"
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							rows={3}
						/>
					</div>
				</div>
			)}
			<FixoraButton onClick={save} disabled={loading || photoUploading}>
				{t('mypage.settings.save')}
			</FixoraButton>
				</>
			)}
		</div>
	);
};

export default SettingsTab;
