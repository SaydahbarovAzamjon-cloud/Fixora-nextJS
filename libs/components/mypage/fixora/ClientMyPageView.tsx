import React, { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, useReactiveVar } from '@apollo/client';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ProfileHeader from './ProfileHeader';
import OwnerActiveRequestsTab from './OwnerActiveRequestsTab';
import OwnerRepairHistoryTab from './OwnerRepairHistoryTab';
import SavedTechniciansTab from './SavedTechniciansTab';
import FollowingTab from './FollowingTab';
import OwnerReviewsTab from './OwnerReviewsTab';
import ClientSettingsTab, { ClientSettingsSection } from './ClientSettingsTab';
import {
	ClientRepairHistoryTab,
	ClientReviewsTab,
	ClientSavedTechniciansTab,
} from './PublicClientTabs';
import { Booking } from '../../../types/fixora/fixora';
import { formatKrw } from '../../../utils/formatCurrency';
import { dateLocale } from '../../../utils/i18nLocale';
import { ClientMyPageStats } from '../../../hooks/useClientMyPageStats';
import { OwnerMyPageTab, OWNER_MY_PAGE_TABS } from '../../../utils/clientMyPageRoute';
import { useProfileImageUpload } from '../../../hooks/useProfileImageUpload';
import { UPDATE_USER } from '../../../../apollo/user/profile';
import { profileImageDraftVar } from '../../../../apollo/store';
import { readStoredProfileImage, syncUserVarFromGraphqlUser, writeStoredProfileImage } from '../../../auth/syncUserVar';
import { hasRealProfileImage, resolvePreferredProfileImage } from '../../../utils/profileImage';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../sweetAlert';

type PublicTab = 'repairHistory' | 'savedTechnicians' | 'following' | 'reviews';
export type ClientMyPageTab = OwnerMyPageTab | PublicTab;

const PUBLIC_TABS: PublicTab[] = ['repairHistory', 'savedTechnicians', 'following', 'reviews'];

const TAB_ICONS: Record<OwnerMyPageTab, React.ReactNode> = {
	activeRequests: <BuildOutlinedIcon fontSize="inherit" />,
	repairHistory: <HistoryOutlinedIcon fontSize="inherit" />,
	savedTechnicians: <FavoriteBorderOutlinedIcon fontSize="inherit" />,
	following: <PersonAddAlt1OutlinedIcon fontSize="inherit" />,
	reviews: <StarOutlineOutlinedIcon fontSize="inherit" />,
	settings: <SettingsOutlinedIcon fontSize="inherit" />,
};

const formatMemberSince = (
	createdAt: string | undefined,
	locale: string | undefined,
	t: (key: string, options?: Record<string, string>) => string,
) => {
	if (!createdAt) return '';
	const label = new Intl.DateTimeFormat(dateLocale(locale), { month: 'long', year: 'numeric' }).format(
		new Date(createdAt),
	);
	return t('mypage.memberSince', { date: label });
};

interface ClientMyPageViewProps {
	mode: 'owner' | 'public';
	profile?: any;
	activeTab: ClientMyPageTab;
	bookings: Booking[];
	stats?: ClientMyPageStats;
	followingCount?: number;
	totalSpent?: number;
	clientId?: string;
	settingsSection?: ClientSettingsSection;
	onSelectTab: (tab: ClientMyPageTab) => void;
	onSettingsSectionChange?: (section: ClientSettingsSection) => void;
	onOpenSettingsSection?: (section: ClientSettingsSection) => void;
	onRefetchBookings?: () => void;
	onRefetchProfile?: () => void;
	settingsUserId?: string;
	profileLoading?: boolean;
}

const ClientMyPageView = ({
	mode,
	profile,
	activeTab,
	bookings,
	stats,
	followingCount = profile?.followingCount ?? 0,
	totalSpent = 0,
	clientId,
	settingsSection = 'menu',
	onSelectTab,
	onSettingsSectionChange,
	onOpenSettingsSection,
	onRefetchBookings,
	onRefetchProfile,
	settingsUserId,
	profileLoading = false,
}: ClientMyPageViewProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const isPublic = mode === 'public';
	const profileDraft = useReactiveVar(profileImageDraftVar);
	const uploadInFlightRef = useRef(false);

	const onUploadError = useCallback(
		(key: string) => {
			if (key === 'invalidType') void sweetMixinErrorAlert(t('mypage.settings.photoInvalidType'));
			else if (key === 'tooLarge') void sweetMixinErrorAlert(t('mypage.settings.photoTooLarge'));
		},
		[t],
	);

	const avatar = useProfileImageUpload(onUploadError);
	const [updateUser] = useMutation(UPDATE_USER);

	useEffect(() => {
		if (!profile?._id || isPublic) return;
		const stored = readStoredProfileImage(profile._id);
		const path = resolvePreferredProfileImage(profile.userProfileImage, stored);
		if (path && hasRealProfileImage(path)) {
			avatar.setExistingImage(path);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate when profile image changes
	}, [profile?._id, profile?.userProfileImage, isPublic]);

	const uploadProfileImage = avatar.uploadProfileImage;
	const clearDraftAfterSave = avatar.clearDraftAfterSave;
	const coverFile = avatar.cover?.file;

	const persistPendingPhoto = useCallback(async () => {
		if (!coverFile || !profile?._id) return;
		const path = await uploadProfileImage();
		if (!path) throw new Error('Upload failed');
		const { data } = await updateUser({
			variables: { input: { _id: profile._id, userProfileImage: path } },
		});
		// Always keep the uploaded Fixora path — do not fall back to OAuth CDN from stale profile.
		const savedPath = path;
		const serverPath = data?.updateUser?.userProfileImage as string | undefined;
		const finalPath =
			serverPath && !serverPath.startsWith('http://') && !serverPath.startsWith('https://')
				? serverPath
				: savedPath;
		clearDraftAfterSave(finalPath);
		writeStoredProfileImage(profile._id, finalPath);
		syncUserVarFromGraphqlUser({ _id: profile._id, userProfileImage: finalPath });
		onRefetchProfile?.();
	}, [clearDraftAfterSave, coverFile, onRefetchProfile, profile?._id, updateUser, uploadProfileImage]);

	useEffect(() => {
		if (!coverFile || uploadInFlightRef.current || isPublic) return;
		uploadInFlightRef.current = true;
		persistPendingPhoto()
			.then(() => sweetTopSmallSuccessAlert(t('mypage.settings.photoSaved'), 800))
			.catch(sweetErrorHandling)
			.finally(() => {
				uploadInFlightRef.current = false;
			});
	}, [coverFile, isPublic, persistPendingPhoto, t]);

	const storedHeader = profile?._id ? readStoredProfileImage(profile._id) : null;
	const headerImage =
		profileDraft ?? resolvePreferredProfileImage(profile?.userProfileImage, storedHeader);
	const tabs = isPublic ? PUBLIC_TABS : OWNER_MY_PAGE_TABS;
	const displayName = profile?.userFullName || profile?.userNickname || '';
	const settingsId = profile?._id ?? settingsUserId;
	const completedBookings = bookings.filter((booking) => booking.bookingStatus === 'COMPLETED');

	const ownerStats = stats ?? {
		repairsCount: bookings.length,
		completedCount: completedBookings.length,
		reviewsCount: 0,
		followingCount,
		savedCount: 0,
		avgRatingGiven: null,
		totalSpent,
		uniqueDevicesRepaired: 0,
	};

	return (
		<div className="fixora-mypage-page">
			<div className="container fixora-mypage">
				<ProfileHeader
					name={displayName}
					image={headerImage}
					readOnly={isPublic}
					onChangePhoto={isPublic ? undefined : avatar.openPicker}
					photoUploading={avatar.uploading}
					onEditProfile={
						isPublic
							? undefined
							: () => {
									if (onOpenSettingsSection) {
										onOpenSettingsSection('profile');
										return;
									}
									onSelectTab('settings');
									onSettingsSectionChange?.('profile');
								}
					}
					memberSince={
						isPublic
							? formatMemberSince(profile?.createdAt, router.locale, t)
							: formatMemberSince(profile?.createdAt, router.locale, t)
					}
					location={profile?.userLocation}
					repairsCount={isPublic ? completedBookings.length : ownerStats.repairsCount}
					reviewsCount={isPublic ? profile?.reviewCount ?? 0 : ownerStats.reviewsCount}
					followingCount={followingCount}
					savedCount={isPublic ? 0 : ownerStats.savedCount}
					avgRatingGiven={isPublic ? profile?.averageRating ?? null : ownerStats.avgRatingGiven}
					totalSpent={isPublic ? totalSpent : ownerStats.totalSpent}
					stats={
						isPublic
							? [
									{ value: completedBookings.length, label: t('clientProfile.stats.repairs') },
									{ value: profile?.reviewCount ?? '—', label: t('clientProfile.stats.reviews') },
									{ value: followingCount, label: t('clientProfile.stats.following') },
									{ value: '—', label: t('clientProfile.stats.saved') },
									{
										value: profile?.averageRating ? `${profile.averageRating.toFixed(1)}★` : '—',
										label: t('clientProfile.stats.averageRating'),
									},
									{ value: formatKrw(totalSpent), label: t('clientProfile.stats.totalSpent') },
								]
							: undefined
					}
				/>

				{!isPublic && (
					<input
						ref={avatar.fileRef}
						type="file"
						accept="image/png,image/jpeg,image/jpg,image/webp"
						hidden
						onChange={avatar.pickFile}
					/>
				)}

				<div className="fixora-mypage__tabs">
					{tabs.map((item) => (
						<button
							key={item}
							type="button"
							className={`fixora-mypage__tab ${activeTab === item ? 'fixora-mypage__tab--active' : ''}`}
							onClick={() => onSelectTab(item)}
						>
							{!isPublic && TAB_ICONS[item as OwnerMyPageTab]}
							{t(isPublic ? `clientProfile.tabs.${item}` : `mypage.tabs.${item}`)}
						</button>
					))}
				</div>

				<div className="fixora-mypage__content">
					{!isPublic && activeTab === 'activeRequests' && (
						<OwnerActiveRequestsTab bookings={bookings} />
					)}
					{!isPublic && activeTab === 'repairHistory' && (
						<OwnerRepairHistoryTab bookings={bookings} stats={ownerStats} />
					)}
					{!isPublic && activeTab === 'savedTechnicians' && <SavedTechniciansTab />}
					{!isPublic && activeTab === 'following' && <FollowingTab />}
					{!isPublic && activeTab === 'reviews' && <OwnerReviewsTab bookings={bookings} />}
					{!isPublic && activeTab === 'settings' && (
						profileLoading && !settingsId ? (
							<div className="fixora-mypage__settings-loading">{t('mypage.settings.loading')}</div>
						) : settingsId ? (
							<ClientSettingsTab
								userId={settingsId}
								userFullName={profile?.userFullName}
								userNickname={profile?.userNickname}
								userLocation={profile?.userLocation}
								userBio={profile?.userBio}
								section={settingsSection}
								onSectionChange={onSettingsSectionChange}
								onOpenPhotoPicker={avatar.openPicker}
								photoUploading={avatar.uploading}
								uploadPendingPhoto={
									avatar.cover?.file
										? async () => {
												await persistPendingPhoto();
											}
										: undefined
								}
							/>
						) : null
					)}

					{isPublic && activeTab === 'repairHistory' && <ClientRepairHistoryTab bookings={bookings} />}
					{isPublic && activeTab === 'savedTechnicians' && <ClientSavedTechniciansTab />}
					{isPublic && activeTab === 'following' && clientId && <FollowingTab userId={clientId} readOnly />}
					{isPublic && activeTab === 'reviews' && <ClientReviewsTab bookings={bookings} />}
				</div>
			</div>
		</div>
	);
};

export default ClientMyPageView;
