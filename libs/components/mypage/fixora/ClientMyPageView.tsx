import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import ProfileHeader from './ProfileHeader';
import RequestsTab from './RequestsTab';
import FollowingTab from './FollowingTab';
import RepairStoriesTab from './RepairStoriesTab';
import SettingsTab from './SettingsTab';
import {
	ClientRepairHistoryTab,
	ClientReviewsTab,
	ClientSavedTechniciansTab,
} from './PublicClientTabs';
import { Booking } from '../../../types/fixora/fixora';
import { formatKrw } from '../../../utils/formatCurrency';
import { dateLocale } from '../../../utils/i18nLocale';

type OwnerTab = 'requests' | 'following' | 'stories' | 'settings';
type PublicTab = 'repairHistory' | 'savedTechnicians' | 'following' | 'reviews';
export type ClientMyPageTab = OwnerTab | PublicTab;

const OWNER_TABS: OwnerTab[] = ['requests', 'following', 'stories', 'settings'];
const PUBLIC_TABS: PublicTab[] = ['repairHistory', 'savedTechnicians', 'following', 'reviews'];

const formatMemberSince = (createdAt: string | undefined, locale: string | undefined, t: (key: string, options?: any) => string) => {
	if (!createdAt) return '';
	const label = new Intl.DateTimeFormat(dateLocale(locale), { month: 'long', year: 'numeric' }).format(new Date(createdAt));
	return t('clientProfile.memberSince', { date: label });
};

interface ClientMyPageViewProps {
	mode: 'owner' | 'public';
	profile?: any;
	activeTab: ClientMyPageTab;
	bookings: Booking[];
	requestsCount?: number;
	followingCount?: number;
	totalSpent?: number;
	clientId?: string;
	onSelectTab: (tab: ClientMyPageTab) => void;
	onRefetchBookings?: () => void;
}

const ClientMyPageView = ({
	mode,
	profile,
	activeTab,
	bookings,
	requestsCount = bookings.length,
	followingCount = profile?.followingCount ?? 0,
	totalSpent = 0,
	clientId,
	onSelectTab,
	onRefetchBookings,
}: ClientMyPageViewProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const isPublic = mode === 'public';
	const tabs = isPublic ? PUBLIC_TABS : OWNER_TABS;
	const displayName = profile?.userFullName || profile?.userNickname || '';
	const completedBookings = bookings.filter((booking) => booking.bookingStatus === 'COMPLETED');

	return (
		<div className="fixora-mypage-page">
			<div className="container fixora-mypage">
				<ProfileHeader
					name={displayName}
					email={isPublic ? undefined : profile?.userEmail}
					image={profile?.userProfileImage}
					requestsCount={requestsCount}
					followingCount={followingCount}
					storiesCount={profile?.userArticles ?? 0}
					onEditProfile={isPublic ? undefined : () => onSelectTab('settings')}
					readOnly={isPublic}
					memberSince={isPublic ? formatMemberSince(profile?.createdAt, router.locale, t) : undefined}
					location={isPublic ? profile?.userLocation : undefined}
					stats={isPublic ? [
						{ value: completedBookings.length, label: t('clientProfile.stats.repairs') },
						{ value: profile?.reviewCount ?? '—', label: t('clientProfile.stats.reviews') },
						{ value: followingCount, label: t('clientProfile.stats.following') },
						{ value: '—', label: t('clientProfile.stats.saved') },
						{
							value: profile?.averageRating ? `${profile.averageRating.toFixed(1)}★` : '—',
							label: t('clientProfile.stats.averageRating'),
						},
						{ value: formatKrw(totalSpent), label: t('clientProfile.stats.totalSpent') },
					] : undefined}
				/>

				<div className="fixora-mypage__tabs">
					{tabs.map((item) => (
						<button
							key={item}
							type="button"
							className={`fixora-mypage__tab ${activeTab === item ? 'fixora-mypage__tab--active' : ''}`}
							onClick={() => onSelectTab(item)}
						>
							{t(isPublic ? `clientProfile.tabs.${item}` : `mypage.tabs.${item}`)}
						</button>
					))}
				</div>

				<div className="fixora-mypage__content">
					{!isPublic && activeTab === 'requests' && <RequestsTab bookings={bookings} onRefetch={onRefetchBookings} />}
					{!isPublic && activeTab === 'following' && <FollowingTab />}
					{!isPublic && activeTab === 'stories' && <RepairStoriesTab />}
					{!isPublic && activeTab === 'settings' && profile?._id && (
						<SettingsTab
							userId={profile._id}
							userFullName={profile.userFullName}
							userNickname={profile.userNickname}
							userLocation={profile.userLocation}
							userBio={profile.userBio}
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
