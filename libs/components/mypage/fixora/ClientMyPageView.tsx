import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
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
	onRefetchBookings?: () => void;
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
	onRefetchBookings,
}: ClientMyPageViewProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const isPublic = mode === 'public';
	const tabs = isPublic ? PUBLIC_TABS : OWNER_MY_PAGE_TABS;
	const displayName = profile?.userFullName || profile?.userNickname || '';
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
					image={profile?.userProfileImage}
					readOnly={isPublic}
					onEditProfile={
						isPublic
							? undefined
							: () => {
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
					{!isPublic && activeTab === 'settings' && profile?._id && (
						<ClientSettingsTab
							userId={profile._id}
							userFullName={profile.userFullName}
							userNickname={profile.userNickname}
							userLocation={profile.userLocation}
							userBio={profile.userBio}
							section={settingsSection}
							onSectionChange={onSettingsSectionChange}
						/>
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
