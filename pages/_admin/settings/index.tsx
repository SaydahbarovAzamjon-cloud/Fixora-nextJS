import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Shield, Globe, Users, Clock } from 'lucide-react';
import withAdminLayout from '../../../libs/components/layout/AdminLayout';
import { adminPageProps } from '../../../libs/i18n/adminPageProps';
import AdminHeader from '../../../libs/components/admin/AdminHeader';
import AdminStatusBadge from '../../../libs/components/admin/shared/AdminStatusBadge';
import { FixoraInput, FixoraSelect } from '../../../libs/components/ui';
import AdminProfileAvatarUpload from '../../../libs/components/admin/settings/AdminProfileAvatarUpload';
import { useProfileImageUpload } from '../../../libs/hooks/useProfileImageUpload';
import { syncUserVarFromGraphqlUser } from '../../../libs/auth/syncUserVar';
import { GET_ADMIN_PLATFORM_SETTINGS, GET_ALL_USERS_BY_ADMIN, GET_ADMIN_USER } from '../../../apollo/admin/query';
import { UPDATE_ADMIN_PLATFORM_SETTINGS, UPDATE_USER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { CHANGE_PASSWORD } from '../../../apollo/user/settings';
import { userVar } from '../../../apollo/store';
import { displayUserName } from '../../../libs/hooks/useUserLookup';
import { resolveProfileImageUrl } from '../../../libs/utils/profileImage';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
import type { AdminPlatformSettings, AdminUser } from '../../../libs/types/admin/admin';

const AdminSettingsPage: NextPage = () => {
	const { t } = useTranslation('admin');
	const currentUser = useReactiveVar(userVar);
	const userId = currentUser?._id ?? '';

	const { data: profileData, refetch } = useQuery(GET_ADMIN_USER, {
		variables: { userId },
		skip: !userId,
		fetchPolicy: 'cache-and-network',
	});

	const { data: teamData } = useQuery(GET_ALL_USERS_BY_ADMIN, {
		variables: { input: { page: 1, limit: 20, search: { userType: 'ADMIN' } } },
		fetchPolicy: 'cache-and-network',
	});

	const { data: platformData, refetch: refetchPlatform } = useQuery(GET_ADMIN_PLATFORM_SETTINGS, {
		fetchPolicy: 'cache-and-network',
	});

	const [updateUser, { loading: saving }] = useMutation(UPDATE_USER_BY_ADMIN);
	const [changePassword, { loading: savingPassword }] = useMutation(CHANGE_PASSWORD);
	const [updatePlatform, { loading: savingPlatform }] = useMutation(UPDATE_ADMIN_PLATFORM_SETTINGS);

	const profile: AdminUser | undefined = profileData?.getUser;
	const team: AdminUser[] = teamData?.getAllUsersByAdmin?.list ?? [];
	const platform: AdminPlatformSettings | undefined = platformData?.getAdminPlatformSettings;

	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [defaultLocale, setDefaultLocale] = useState('ko');
	const [defaultCurrency, setDefaultCurrency] = useState('KRW');
	const [defaultTimezone, setDefaultTimezone] = useState('Asia/Seoul');
	const [moderationSlaHours, setModerationSlaHours] = useState(24);

	const onAvatarError = (key: string) => {
		if (key === 'invalidType') sweetMixinErrorAlert(t('settings.profile.invalidType')).then();
		else if (key === 'tooLarge') sweetMixinErrorAlert(t('settings.profile.tooLarge')).then();
	};
	const avatar = useProfileImageUpload(onAvatarError);

	useEffect(() => {
		if (profile?.userProfileImage !== undefined) {
			avatar.setExistingImage(profile.userProfileImage);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [profile?.userProfileImage]);

	useEffect(() => {
		if (profile) {
			setFullName(profile.userFullName ?? '');
			setEmail(profile.userEmail ?? '');
		}
	}, [profile]);

	useEffect(() => {
		if (platform) {
			setDefaultLocale(platform.defaultLocale);
			setDefaultCurrency(platform.defaultCurrency);
			setDefaultTimezone(platform.defaultTimezone);
			setModerationSlaHours(platform.moderationSlaHours);
		}
	}, [platform]);

	const handleSaveProfile = async () => {
		if (!userId) return;
		try {
			let imagePath: string | undefined;
			if (avatar.cover?.file) {
				imagePath = await avatar.uploadProfileImage();
				if (!imagePath) {
					await sweetMixinErrorAlert(t('settings.profile.uploadFailed'));
					return;
				}
			}

			const result = await updateUser({
				variables: {
					input: {
						_id: userId,
						userFullName: fullName || undefined,
						...(imagePath ? { userProfileImage: imagePath } : {}),
					},
				},
			});
			const saved = result.data?.updateUserByAdmin as AdminUser | undefined;
			if (saved) {
				syncUserVarFromGraphqlUser(saved);
				avatar.clearDraftAfterSave(saved.userProfileImage);
			}
			await sweetTopSmallSuccessAlert(t('settings.saved'), 1200);
			await refetch();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const handleChangePassword = async () => {
		if (!currentPassword || !newPassword) return;
		if (newPassword.length < 5 || newPassword.length > 12) {
			await sweetErrorHandling(new Error(t('settings.profile.passwordLength')));
			return;
		}
		if (newPassword !== confirmPassword) {
			await sweetErrorHandling(new Error(t('settings.profile.passwordMismatch')));
			return;
		}
		try {
			await changePassword({
				variables: {
					input: {
						currentPassword,
						newPassword,
					},
				},
			});
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
			await sweetTopSmallSuccessAlert(t('settings.profile.passwordSaved'), 1200);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const handleSavePlatform = async () => {
		try {
			await updatePlatform({
				variables: {
					input: {
						defaultLocale,
						defaultCurrency,
						defaultTimezone,
						moderationSlaHours,
					},
				},
			});
			await sweetTopSmallSuccessAlert(t('settings.saved'), 1200);
			await refetchPlatform();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<>
			<AdminHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />
			<div className="fixora-admin-page">
				<div className="fixora-admin-settings-grid">
					<div className="fixora-admin-card">
						<h3 className="fixora-admin-card__title">
							<Shield size={16} /> {t('settings.profile.title')}
						</h3>
						<AdminProfileAvatarUpload avatar={avatar} disabled={saving || avatar.uploading} />
						<div className="fixora-admin-form-grid fixora-admin-form-grid--after-avatar">
							<FixoraInput
								label={t('settings.profile.fullName')}
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
							/>
							<FixoraInput
								label={t('settings.profile.email')}
								type="email"
								value={email}
								readOnly
								disabled
							/>
						</div>
						<div className="fixora-admin-card__footer">
							<button
								type="button"
								className="fixora-admin-btn fixora-admin-btn--primary"
								onClick={handleSaveProfile}
								disabled={saving || avatar.uploading}
							>
								{t('settings.profile.save')}
							</button>
						</div>
					</div>

					<div className="fixora-admin-card">
						<h3 className="fixora-admin-card__title">
							<Shield size={16} /> {t('settings.profile.changePasswordTitle')}
						</h3>
						<p className="fixora-admin-card__hint">{t('settings.profile.changePasswordHint')}</p>
						<div className="fixora-admin-form-grid">
							<FixoraInput
								label={t('settings.profile.currentPassword')}
								type="password"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								autoComplete="current-password"
							/>
							<FixoraInput
								label={t('settings.profile.newPassword')}
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								autoComplete="new-password"
							/>
							<div className="fixora-admin-field fixora-admin-field--full">
								<FixoraInput
									label={t('settings.profile.confirmPassword')}
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									autoComplete="new-password"
								/>
							</div>
						</div>
						<div className="fixora-admin-card__footer">
							<button
								type="button"
								className="fixora-admin-btn fixora-admin-btn--primary"
								onClick={handleChangePassword}
								disabled={savingPassword || !currentPassword || !newPassword}
							>
								{t('settings.profile.changePassword')}
							</button>
						</div>
					</div>

					<div className="fixora-admin-card">
						<h3 className="fixora-admin-card__title">
							<Globe size={16} /> {t('settings.preferences.title')}
						</h3>
						<div className="fixora-admin-form-grid">
							<FixoraSelect
								label={t('settings.preferences.language')}
								value={defaultLocale}
								onChange={(e) => setDefaultLocale(e.target.value)}
								options={[
									{ value: 'ko', label: '한국어 (KO)' },
									{ value: 'en', label: 'English (EN)' },
								]}
							/>
							<FixoraSelect
								label={t('settings.preferences.currency')}
								value={defaultCurrency}
								onChange={(e) => setDefaultCurrency(e.target.value)}
								options={[{ value: 'KRW', label: 'KRW (₩)' }]}
							/>
							<FixoraSelect
								label={t('settings.preferences.timezone')}
								value={defaultTimezone}
								onChange={(e) => setDefaultTimezone(e.target.value)}
								options={[{ value: 'Asia/Seoul', label: 'Asia/Seoul (KST)' }]}
							/>
						</div>
						<div className="fixora-admin-card__footer--split">
							<span className="fixora-admin-verification__list-meta">
								{t('settings.preferences.darkMode')} — {t('settings.preferences.locked')}
							</span>
							<button
								type="button"
								className="fixora-admin-btn fixora-admin-btn--primary"
								onClick={handleSavePlatform}
								disabled={savingPlatform}
							>
								{t('settings.preferences.save')}
							</button>
						</div>
					</div>

					<div className="fixora-admin-card">
						<h3 className="fixora-admin-card__title">
							<Clock size={16} /> {t('settings.moderation.title')}
						</h3>
						<div className="fixora-admin-field">
							<label>{t('settings.moderation.slaTitle')}</label>
							<input
								type="number"
								min={1}
								max={168}
								value={moderationSlaHours}
								onChange={(e) => setModerationSlaHours(Number(e.target.value))}
							/>
							<p className="fixora-admin-field__helper">{t('settings.moderation.slaDesc')}</p>
						</div>
						<div className="fixora-admin-card__footer">
							<button
								type="button"
								className="fixora-admin-btn fixora-admin-btn--secondary"
								onClick={handleSavePlatform}
								disabled={savingPlatform}
							>
								{t('settings.preferences.save')}
							</button>
						</div>
					</div>

					<div className="fixora-admin-card">
						<h3 className="fixora-admin-card__title">
							<Users size={16} /> {t('settings.team.title')}
						</h3>
						{team.length === 0 && <div className="fixora-admin-empty">{t('settings.team.empty')}</div>}
						{team.map((admin) => (
							<div key={admin._id} className="fixora-admin-list-row">
								<div className="fixora-admin-list-row__main">
									<div className="fixora-admin-table-user__avatar">
										<img src={resolveProfileImageUrl(admin.userProfileImage)} alt="" />
									</div>
									<div className="fixora-admin-list-row__body">
										<div className="fixora-admin-table-user__name">{displayUserName(admin)}</div>
										<div className="fixora-admin-verification__list-meta">{admin.userEmail}</div>
									</div>
								</div>
								<AdminStatusBadge label={t('nav.superAdmin')} tone="primary" />
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
};

export const getServerSideProps = adminPageProps;

export default withAdminLayout(AdminSettingsPage, { title: 'Settings' });
