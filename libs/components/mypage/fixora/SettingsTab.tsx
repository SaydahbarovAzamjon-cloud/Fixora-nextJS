import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { UPDATE_USER } from '../../../../apollo/user/profile';
import { getJwtToken, updateUserInfo } from '../../../auth';
import { FixoraButton, FixoraInput } from '../../ui';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../sweetAlert';

export interface SettingsTabProps {
	userId: string;
	userFullName?: string;
	userNickname?: string;
	userLocation?: string;
	userBio?: string;
}

const SettingsTab = ({ userId, userFullName, userNickname, userLocation, userBio }: SettingsTabProps) => {
	const { t } = useTranslation('common');
	const [fullName, setFullName] = useState(userFullName ?? '');
	const [nickname, setNickname] = useState(userNickname ?? '');
	const [location, setLocation] = useState(userLocation ?? '');
	const [bio, setBio] = useState(userBio ?? '');

	const [updateUser, { loading }] = useMutation(UPDATE_USER);

	const save = async () => {
		try {
			await updateUser({
				variables: {
					input: {
						_id: userId,
						userFullName: fullName,
						userNickname: nickname,
						userLocation: location,
						userBio: bio,
					},
				},
			});
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
			await sweetTopSmallSuccessAlert(t('mypage.settings.saved'), 800);
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<div className="fixora-mypage__settings">
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
			<FixoraInput
				label={t('mypage.settings.location')}
				value={location}
				onChange={(e) => setLocation(e.target.value)}
			/>
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
			<FixoraButton onClick={save} disabled={loading}>
				{t('mypage.settings.save')}
			</FixoraButton>
		</div>
	);
};

export default SettingsTab;
