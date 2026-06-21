import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery, useReactiveVar } from '@apollo/client';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import ClientMyPageView, { ClientMyPageTab } from '../../libs/components/mypage/fixora/ClientMyPageView';
import { GET_USER } from '../../apollo/user/query';
import { GET_MY_BOOKINGS } from '../../apollo/user/profile';
import { userVar } from '../../apollo/store';
import { isCustomerUser } from '../../libs/utils/userRole';
import { Booking } from '../../libs/types/fixora/fixora';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const TABS = ['requests', 'following', 'stories', 'settings'] as const;
type Tab = (typeof TABS)[number];

const MyPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const isCustomer = isCustomerUser(user);

	const tab = (router.query.tab as Tab) ?? 'requests';

	/** APOLLO REQUESTS **/
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

	const bookings: Booking[] = bookingsData?.getMyBookings?.list ?? [];
	const requestsCount = bookingsData?.getMyBookings?.metaCounter?.[0]?.total ?? bookings.length;

	/** LIFECYCLES **/
	useEffect(() => {
		if (!user?._id) {
			router.push('/').then();
		}
	}, [user]);

	/** HANDLERS **/
	const selectTab = (next: ClientMyPageTab) => {
		router.push(`/mypage?tab=${next}`, undefined, { shallow: true });
	};

	return (
		<ClientMyPageView
			mode="owner"
			profile={profile}
			activeTab={tab}
			bookings={bookings}
			requestsCount={requestsCount}
			onSelectTab={selectTab}
			onRefetchBookings={() => refetchBookings()}
		/>
	);
};

export default withLayoutFull(MyPage);
