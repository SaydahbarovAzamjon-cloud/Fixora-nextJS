import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery, useReactiveVar } from '@apollo/client';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import ProfileHeader from '../../libs/components/mypage/fixora/ProfileHeader';
import RequestsTab from '../../libs/components/mypage/fixora/RequestsTab';
import FollowingTab from '../../libs/components/mypage/fixora/FollowingTab';
import RepairStoriesTab from '../../libs/components/mypage/fixora/RepairStoriesTab';
import SettingsTab from '../../libs/components/mypage/fixora/SettingsTab';
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
	const { t } = useTranslation('common');
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
	const selectTab = (next: Tab) => {
		router.push(`/mypage?tab=${next}`, undefined, { shallow: true });
	};

	return (
		<div className="fixora-mypage-page">
			<div className="container fixora-mypage">
				<ProfileHeader
					name={profile?.userFullName || profile?.userNickname || ''}
					email={profile?.userEmail}
					image={profile?.userProfileImage}
					requestsCount={requestsCount}
					followingCount={profile?.followingCount ?? 0}
					storiesCount={profile?.userArticles ?? 0}
					onEditProfile={() => selectTab('settings')}
				/>

				<div className="fixora-mypage__tabs">
					{TABS.map((item) => (
						<button
							key={item}
							type="button"
							className={`fixora-mypage__tab ${tab === item ? 'fixora-mypage__tab--active' : ''}`}
							onClick={() => selectTab(item)}
						>
							{t(`mypage.tabs.${item}`)}
						</button>
					))}
				</div>

				<div className="fixora-mypage__content">
					{tab === 'requests' && <RequestsTab bookings={bookings} onRefetch={() => refetchBookings()} />}
					{tab === 'following' && <FollowingTab />}
					{tab === 'stories' && <RepairStoriesTab />}
					{tab === 'settings' && profile?._id && (
						<SettingsTab
							userId={profile._id}
							userFullName={profile.userFullName}
							userNickname={profile.userNickname}
							userLocation={profile.userLocation}
							userBio={profile.userBio}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default withLayoutFull(MyPage);
