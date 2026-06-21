import React, { useEffect, useMemo } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import withTechnicianLayout from '../../libs/components/layout/TechnicianLayout';
import { technicianPageProps } from '../../libs/i18n/technicianPageProps';
import ProfileHeader from '../../libs/components/mypage/fixora/ProfileHeader';
import FollowingTab from '../../libs/components/mypage/fixora/FollowingTab';
import {
	ClientRepairHistoryTab,
	ClientReviewsTab,
	ClientSavedTechniciansTab,
} from '../../libs/components/mypage/fixora/PublicClientTabs';
import { GET_USER } from '../../apollo/user/query';
import { GET_INCOMING_REQUESTS, GET_TECHNICIAN_BOOKINGS, GET_USER_FOLLOWINGS } from '../../apollo/user/profile';
import { Booking } from '../../libs/types/fixora/fixora';
import { formatKrw } from '../../libs/utils/formatCurrency';
import { dateLocale } from '../../libs/utils/i18nLocale';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: await technicianPageProps(locale),
});

const TABS = ['repairHistory', 'savedTechnicians', 'following', 'reviews'] as const;
type Tab = (typeof TABS)[number];

const uniqueBookings = (bookings: Booking[]) => {
	const map = new Map<string, Booking>();
	bookings.forEach((booking) => {
		if (booking?._id) map.set(booking._id, booking);
	});
	return Array.from(map.values());
};

const formatMemberSince = (createdAt: string | undefined, locale: string | undefined, t: (key: string, options?: any) => string) => {
	if (!createdAt) return '';
	const label = new Intl.DateTimeFormat(dateLocale(locale), { month: 'long', year: 'numeric' }).format(new Date(createdAt));
	return t('clientProfile.memberSince', { date: label });
};

const PublicClientProfile: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const clientId = router.query.clientId as string | undefined;
	const tab = (router.query.tab as Tab) && TABS.includes(router.query.tab as Tab)
		? (router.query.tab as Tab)
		: 'repairHistory';

	const { data: clientData, loading: clientLoading } = useQuery(GET_USER, {
		skip: !router.isReady || !clientId,
		variables: { userId: clientId },
		fetchPolicy: 'network-only',
	});

	const { data: followingData } = useQuery(GET_USER_FOLLOWINGS, {
		skip: !router.isReady || !clientId,
		variables: { input: { page: 1, limit: 50, search: { followerId: clientId } } },
		fetchPolicy: 'network-only',
	});

	const bookingsInput = { page: 1, limit: 100, search: {} };
	const { data: incomingData } = useQuery(GET_INCOMING_REQUESTS, {
		skip: !router.isReady || !clientId,
		variables: { input: bookingsInput },
		fetchPolicy: 'network-only',
	});
	const { data: technicianBookingsData } = useQuery(GET_TECHNICIAN_BOOKINGS, {
		skip: !router.isReady || !clientId,
		variables: { input: bookingsInput },
		fetchPolicy: 'network-only',
	});

	const profile = clientData?.getUser;
	const profileMatchesRoute = !!profile?._id && !!clientId && profile._id === clientId;
	const visibleBookings = useMemo(() => {
		const incoming = incomingData?.getIncomingRequests?.list ?? [];
		const technicianBookings = technicianBookingsData?.getTechnicianBookings?.list ?? [];
		return uniqueBookings([...incoming, ...technicianBookings]).filter(
			(booking) => booking.userId === clientId || (booking as any).customerData?._id === clientId,
		);
	}, [incomingData, technicianBookingsData, clientId]);

	const completedBookings = useMemo(
		() => visibleBookings.filter((booking) => booking.bookingStatus === 'COMPLETED'),
		[visibleBookings],
	);
	const totalSpent = useMemo(
		() => completedBookings.reduce((sum, booking) => sum + Number(booking.finalPrice ?? booking.estimatedPrice ?? 0), 0),
		[completedBookings],
	);
	const followingCount = followingData?.getUserFollowings?.metaCounter?.[0]?.total ?? profile?.followingCount ?? 0;
	const displayName = profileMatchesRoute ? profile?.userFullName || profile?.userNickname || '' : '';

	useEffect(() => {
		if (!router.isReady || !clientId || !profileMatchesRoute) return;
		if (profile?.userType === 'TECHNICIAN') {
			router.replace(`/technicians/${clientId}`).then();
		}
	}, [router, router.isReady, clientId, profile, profileMatchesRoute]);

	const selectTab = (next: Tab) => {
		if (!clientId) return;
		router.push(`/client/${clientId}?tab=${next}`, undefined, { shallow: true });
	};

	if (!router.isReady || !clientId || clientLoading || !profileMatchesRoute || profile?.userType === 'TECHNICIAN') {
		return (
			<div className="fixora-tech-client-page">
				<div className="fixora-tech-client fixora-mypage">
					<p className="fixora-mypage__empty">{t('common.loading', 'Loading...')}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="fixora-tech-client-page">
			<div className="fixora-tech-client fixora-mypage">
				<ProfileHeader
					name={displayName}
					image={profile.userProfileImage}
					requestsCount={completedBookings.length}
					followingCount={followingCount}
					storiesCount={0}
					readOnly
					memberSince={formatMemberSince(profile.createdAt, router.locale, t)}
					location={profile.userLocation}
					stats={[
						{ value: completedBookings.length, label: t('clientProfile.stats.repairs') },
						{ value: profile.reviewCount ?? '—', label: t('clientProfile.stats.reviews') },
						{ value: followingCount, label: t('clientProfile.stats.following') },
						{ value: '—', label: t('clientProfile.stats.saved') },
						{
							value: profile.averageRating ? `${profile.averageRating.toFixed(1)}★` : '—',
							label: t('clientProfile.stats.averageRating'),
						},
						{ value: formatKrw(totalSpent), label: t('clientProfile.stats.totalSpent') },
					]}
				/>

				<div className="fixora-mypage__tabs">
					{TABS.map((item) => (
						<button
							key={item}
							type="button"
							className={`fixora-mypage__tab ${tab === item ? 'fixora-mypage__tab--active' : ''}`}
							onClick={() => selectTab(item)}
						>
							{t(`clientProfile.tabs.${item}`)}
						</button>
					))}
				</div>

				<div className="fixora-mypage__content">
					{tab === 'repairHistory' && (
						<ClientRepairHistoryTab bookings={visibleBookings} />
					)}
					{tab === 'savedTechnicians' && <ClientSavedTechniciansTab />}
					{tab === 'following' && <FollowingTab userId={clientId} readOnly />}
					{tab === 'reviews' && <ClientReviewsTab bookings={visibleBookings} />}
				</div>
			</div>
		</div>
	);
};

export default withTechnicianLayout(PublicClientProfile);
