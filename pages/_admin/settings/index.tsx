import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Shield, Globe, Users, Clock } from 'lucide-react';
import withAdminLayout from '../../../libs/components/layout/AdminLayout';
import { adminPageProps } from '../../../libs/i18n/adminPageProps';
import AdminHeader from '../../../libs/components/admin/AdminHeader';
import AdminStatusBadge from '../../../libs/components/admin/shared/AdminStatusBadge';
import { GET_ADMIN_PLATFORM_SETTINGS, GET_ALL_USERS_BY_ADMIN, GET_ADMIN_USER } from '../../../apollo/admin/query';
import { UPDATE_ADMIN_PLATFORM_SETTINGS, UPDATE_USER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { userVar } from '../../../apollo/store';
import { displayUserName } from '../../../libs/hooks/useUserLookup';
import { resolveProfileImageUrl } from '../../../libs/utils/profileImage';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
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
	const [updatePlatform, { loading: savingPlatform }] = useMutation(UPDATE_ADMIN_PLATFORM_SETTINGS);

	const profile: AdminUser | undefined = profileData?.getUser;
	const team: AdminUser[] = teamData?.getAllUsersByAdmin?.list ?? [];
	const platform: AdminPlatformSettings | undefined = platformData?.getAdminPlatformSettings;

	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [defaultLocale, setDefaultLocale] = useState('ko');
	const [defaultCurrency, setDefaultCurrency] = useState('KRW');
	const [defaultTimezone, setDefaultTimezone] = useState('Asia/Seoul');
	const [moderationSlaHours, setModerationSlaHours] = useState(24);

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
			await updateUser({
				variables: {
					input: {
						_id: userId,
						userFullName: fullName || undefined,
						...(password ? { userPassword: password } : {}),
					},
				},
			});
			setPassword('');
			await sweetTopSmallSuccessAlert(t('settings.saved'), 1200);
			await refetch();
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
						<h3 style={{ margin: '0 0 16px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
							<Shield size={16} /> {t('settings.profile.title')}
						</h3>
						<div className="fixora-admin-form-grid">
							<div className="fixora-admin-field">
								<label>{t('settings.profile.fullName')}</label>
								<input value={fullName} onChange={(e) => setFullName(e.target.value)} />
							</div>
							<div className="fixora-admin-field">
								<label>{t('settings.profile.email')}</label>
								<input type="email" value={email} readOnly disabled />
							</div>
							<div className="fixora-admin-field" style={{ gridColumn: '1 / -1' }}>
								<label>{t('settings.profile.newPassword')}</label>
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder={t('settings.profile.passwordPlaceholder')}
								/>
							</div>
						</div>
						<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
							<button
								type="button"
								className="fixora-admin-btn fixora-admin-btn--primary"
								onClick={handleSaveProfile}
								disabled={saving}
							>
								{t('settings.profile.save')}
							</button>
						</div>
					</div>

					<div className="fixora-admin-card">
						<h3 style={{ margin: '0 0 16px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
							<Globe size={16} /> {t('settings.preferences.title')}
						</h3>
						<div className="fixora-admin-form-grid">
							<div className="fixora-admin-field">
								<label>{t('settings.preferences.language')}</label>
								<select value={defaultLocale} onChange={(e) => setDefaultLocale(e.target.value)}>
									<option value="ko">한국어 (KO)</option>
									<option value="en">English (EN)</option>
								</select>
							</div>
							<div className="fixora-admin-field">
								<label>{t('settings.preferences.currency')}</label>
								<select value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)}>
									<option value="KRW">KRW (₩)</option>
								</select>
							</div>
							<div className="fixora-admin-field">
								<label>{t('settings.preferences.timezone')}</label>
								<select value={defaultTimezone} onChange={(e) => setDefaultTimezone(e.target.value)}>
									<option value="Asia/Seoul">Asia/Seoul (KST)</option>
								</select>
							</div>
						</div>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
							<span style={{ fontSize: 13, color: 'var(--fixora-text-muted)' }}>
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
						<h3 style={{ margin: '0 0 12px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
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
							<p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--fixora-text-muted)' }}>
								{t('settings.moderation.slaDesc')}
							</p>
						</div>
						<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
							<button
								type="button"
								className="fixora-admin-btn fixora-admin-btn--outline"
								onClick={handleSavePlatform}
								disabled={savingPlatform}
							>
								{t('settings.preferences.save')}
							</button>
						</div>
					</div>

					<div className="fixora-admin-card">
						<h3 style={{ margin: '0 0 16px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
							<Users size={16} /> {t('settings.team.title')}
						</h3>
						{team.length === 0 && <div className="fixora-admin-empty">{t('settings.team.empty')}</div>}
						{team.map((admin) => (
							<div
								key={admin._id}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 12,
									padding: '12px 0',
									borderBottom: '1px solid var(--fixora-border-subtle)',
								}}
							>
								<div className="fixora-admin-table-user__avatar">
									<img src={resolveProfileImageUrl(admin.userProfileImage)} alt="" />
								</div>
								<div style={{ flex: 1 }}>
									<div className="fixora-admin-table-user__name">{displayUserName(admin)}</div>
									<div style={{ fontSize: 12, color: 'var(--fixora-text-muted)' }}>{admin.userEmail}</div>
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
