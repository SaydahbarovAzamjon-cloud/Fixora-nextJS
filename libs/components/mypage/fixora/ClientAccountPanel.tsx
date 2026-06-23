import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_USER } from '../../../../apollo/user/query';
import { UPDATE_EMAIL, UPDATE_USER_SLUG } from '../../../../apollo/user/settings';
import { userVar } from '../../../../apollo/store';
import SettingsSectionHead from '../../technician/settings/SettingsSectionHead';
import SettingsField from '../../technician/settings/SettingsField';
import SettingsSaveButton from '../../technician/settings/SettingsSaveButton';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../sweetAlert';

const ClientAccountPanel: React.FC = () => {
	const { t } = useTranslation('technician');
	const user = useReactiveVar(userVar);
	const userId = user?._id;

	const { data, refetch } = useQuery(GET_USER, {
		skip: !userId,
		variables: { userId },
		fetchPolicy: 'network-only',
	});

	const [email, setEmail] = useState('');
	const [slug, setSlug] = useState('');

	const [updateEmail, { loading: emailLoading }] = useMutation(UPDATE_EMAIL);
	const [updateUserSlug, { loading: slugLoading }] = useMutation(UPDATE_USER_SLUG);

	useEffect(() => {
		const remote = data?.getUser;
		if (!remote) return;
		setEmail(remote.userEmail ?? '');
		setSlug(remote.userSlug ?? remote.userNickname ?? '');
	}, [data]);

	const saving = emailLoading || slugLoading;

	const handleSave = async () => {
		if (!userId) return;
		const nextSlug = slug.trim().toLowerCase();
		if (!nextSlug) {
			await sweetMixinErrorAlert(t('settings.account.slugRequired'));
			return;
		}

		const remote = data?.getUser;
		const emailChanged =
			!!email.trim() &&
			email.trim().toLowerCase() !== (remote?.userEmail ?? '').trim().toLowerCase();
		const slugChanged = nextSlug !== (remote?.userSlug ?? remote?.userNickname ?? '').trim().toLowerCase();

		try {
			if (emailChanged) {
				await updateEmail({ variables: { input: { userEmail: email.trim() } } });
			}
			if (slugChanged) {
				await updateUserSlug({ variables: { input: { userSlug: nextSlug } } });
			}
			if (!emailChanged && !slugChanged) return;
			await refetch();
			await sweetTopSmallSuccessAlert(t('settings.account.saved'), 1200);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<div className="fts-section">
			<SettingsSectionHead title={t('settings.account.title')} desc={t('settings.account.desc')} />
			<div className="fts-card">
				<SettingsField label={t('settings.profile.email')}>
					<input
						className="fts-input"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</SettingsField>
				<SettingsField label={t('settings.account.usernameLabel')}>
					<div className="fts-prefix-input">
						<span className="fts-prefix-input__prefix">{t('settings.account.urlPrefix')}</span>
						<input
							className="fts-prefix-input__control"
							value={slug}
							onChange={(e) => setSlug(e.target.value)}
						/>
					</div>
				</SettingsField>
				<SettingsSaveButton onClick={handleSave} loading={saving} label={t('settings.saveChanges')} />
			</div>
		</div>
	);
};

export default ClientAccountPanel;
