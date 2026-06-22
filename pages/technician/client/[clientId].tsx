import React, { useEffect, useMemo } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { technicianPageProps } from '../../../libs/i18n/technicianPageProps';
import ClientMyPageView, { ClientMyPageTab } from '../../../libs/components/mypage/fixora/ClientMyPageView';
import { GET_INCOMING_REQUESTS, GET_PUBLIC_CLIENT_PROFILE, GET_TECHNICIAN_BOOKINGS } from '../../../apollo/user/profile';
import { Booking } from '../../../libs/types/fixora/fixora';

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

const TechnicianClientProfile: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const clientId = router.query.clientId as string | undefined;
	const tab = (router.query.tab as Tab) && TABS.includes(router.query.tab as Tab)
		? (router.query.tab as Tab)
		: 'repairHistory';

	const { data: profileData, loading: profileLoading } = useQuery(GET_PUBLIC_CLIENT_PROFILE, {
		skip: !router.isReady || !clientId,
		variables: { clientId: clientId! },
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

	const publicProfile = profileData?.getPublicClientProfile;
	const profile = publicProfile?.client;
	const profileMatchesRoute = !!profile?._id && !!clientId && profile._id === clientId;

	const visibleBookings = useMemo(() => {
		const incoming = incomingData?.getIncomingRequests?.list ?? [];
		const technicianBookings = technicianBookingsData?.getTechnicianBookings?.list ?? [];
		return uniqueBookings([...incoming, ...technicianBookings]).filter(
			(booking) => booking.userId === clientId || (booking as any).customerData?._id === clientId,
		);
	}, [incomingData, technicianBookingsData, clientId]);

	const totalSpent = publicProfile?.totalSpent ?? 0;
	const followingCount = profile?.followingCount ?? 0;

	useEffect(() => {
		if (!router.isReady || !clientId || !profileMatchesRoute) return;
		if (profile?.userType === 'TECHNICIAN') {
			router.replace(`/technicians/${clientId}`).then();
		}
	}, [router, router.isReady, clientId, profile, profileMatchesRoute]);

	const selectTab = (next: Tab) => {
		if (!clientId) return;
		router.push(`/technician/client/${clientId}?tab=${next}`, undefined, { shallow: true });
	};

	if (!router.isReady || !clientId || profileLoading || !profileMatchesRoute || profile?.userType === 'TECHNICIAN') {
		return (
			<div className="fixora-mypage-page">
				<div className="container fixora-mypage">
					<p className="fixora-mypage__empty">{t('common.loading', 'Loading...')}</p>
				</div>
			</div>
		);
	}

	return (
		<ClientMyPageView
			mode="public"
			profile={profile}
			activeTab={tab as ClientMyPageTab}
			bookings={visibleBookings}
			followingCount={followingCount}
			totalSpent={totalSpent}
			clientId={clientId}
			onSelectTab={(next) => selectTab(next as Tab)}
		/>
	);
};

export default withTechnicianLayout(TechnicianClientProfile);
