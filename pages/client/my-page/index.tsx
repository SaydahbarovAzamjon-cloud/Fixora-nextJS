import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery, useReactiveVar } from '@apollo/client';
import withLayoutFull from '../../../libs/components/layout/LayoutFull';
import ClientMyPageView from '../../../libs/components/mypage/fixora/ClientMyPageView';
import { ClientSettingsSection } from '../../../libs/components/mypage/fixora/ClientSettingsTab';
import { GET_USER } from '../../../apollo/user/query';
import {
	GET_MY_BOOKINGS,
	GET_MY_PAYMENTS,
	GET_MY_REVIEWS,
	GET_USER_FOLLOWINGS,
} from '../../../apollo/user/profile';
import { userVar } from '../../../apollo/store';
import { isCustomerUser } from '../../../libs/utils/userRole';
import { Booking, BookingReview, Payment } from '../../../libs/types/fixora/fixora';
import { useClientMyPageStats } from '../../../libs/hooks/useClientMyPageStats';
import { useSavedTechnicianCount } from '../../../libs/hooks/useSavedTechnicianCount';
import {
	OwnerMyPageTab,
	ownerMyPageHref,
	parseOwnerMyPageTab,
} from '../../../libs/utils/clientMyPageRoute';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const parseSettingsSection = (section: string | string[] | undefined): ClientSettingsSection => {
	const value = Array.isArray(section) ? section[0] : section;
	const allowed: ClientSettingsSection[] = ['menu', 'profile', 'security', 'payment', 'notifications', 'location'];
	return allowed.includes(value as ClientSettingsSection) ? (value as ClientSettingsSection) : 'menu';
};

const ClientMyPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const isCustomer = isCustomerUser(user);

	const tab = parseOwnerMyPageTab(router.query.tab);
	const settingsSection = parseSettingsSection(router.query.section);

	const { data: userData } = useQuery(GET_USER, {
		skip: !user?._id || !isCustomer,
		variables: { userId: user?._id },
		fetchPolicy: 'network-only',
	});

	const profile = userData?.getUser;

	const { data: bookingsData, refetch: refetchBookings } = useQuery(GET_MY_BOOKINGS, {
		skip: !user?._id || !isCustomer,
		variables: { input: { page: 1, limit: 50, search: {} } },
		fetchPolicy: 'network-only',
		pollInterval: isCustomer ? 20000 : 0,
	});

	const { data: reviewsData } = useQuery(GET_MY_REVIEWS, {
		skip: !user?._id || !isCustomer,
		variables: { input: { page: 1, limit: 50, search: {} } },
		fetchPolicy: 'network-only',
	});

	const { data: paymentsData } = useQuery(GET_MY_PAYMENTS, {
		skip: !user?._id || !isCustomer,
		variables: { input: { page: 1, limit: 100, search: {} } },
		fetchPolicy: 'network-only',
	});

	const { data: followingData } = useQuery(GET_USER_FOLLOWINGS, {
		skip: !user?._id || !isCustomer,
		variables: { input: { page: 1, limit: 50, search: { followerId: user?._id } } },
		fetchPolicy: 'network-only',
	});

	const bookings: Booking[] = bookingsData?.getMyBookings?.list ?? [];
	const reviews: BookingReview[] = reviewsData?.getMyReviews?.list ?? [];
	const payments: Payment[] = paymentsData?.getMyPayments?.list ?? [];
	const followingCount =
		followingData?.getUserFollowings?.metaCounter?.[0]?.total ?? profile?.followingCount ?? 0;
	const savedCount = useSavedTechnicianCount(user?._id);

	const stats = useClientMyPageStats({
		bookings,
		reviews,
		payments,
		bookingsTotal: bookingsData?.getMyBookings?.metaCounter?.[0]?.total,
		reviewsTotal: reviewsData?.getMyReviews?.metaCounter?.[0]?.total,
		followingCount,
		savedCount,
	});

	useEffect(() => {
		if (!user?._id) {
			router.push('/login?redirect=/client/my-page').then();
		}
	}, [user, router]);

	const selectTab = (next: OwnerMyPageTab) => {
		router.push(ownerMyPageHref(next), undefined, { shallow: true });
	};

	const changeSettingsSection = (section: ClientSettingsSection) => {
		router.push(ownerMyPageHref('settings', section === 'menu' ? undefined : section), undefined, {
			shallow: true,
		});
	};

	if (!user?._id || !isCustomer) {
		return null;
	}

	return (
		<ClientMyPageView
			mode="owner"
			profile={profile}
			activeTab={tab}
			bookings={bookings}
			stats={stats}
			followingCount={followingCount}
			settingsSection={settingsSection}
			onSelectTab={selectTab}
			onSettingsSectionChange={changeSettingsSection}
			onRefetchBookings={() => refetchBookings()}
		/>
	);
};

export default withLayoutFull(ClientMyPage);
