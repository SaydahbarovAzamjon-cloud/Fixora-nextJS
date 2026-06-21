import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery, useReactiveVar } from '@apollo/client';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { GET_USER } from '../../apollo/user/query';
import { GET_USER_FOLLOWINGS } from '../../apollo/user/profile';
import { userVar } from '../../apollo/store';
import { FixoraButton } from '../../libs/components/ui';
import { resolveProfileImageUrl } from '../../libs/utils/profileImage';
import CustomerReviewsSection from '../../libs/components/member/CustomerReviewsSection';
import { CLIENT_MY_PAGE } from '../../libs/utils/clientMyPageRoute';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

/** Public client (USER) profile — /member?memberId= . Technicians use /technicians/[id]. */
const MemberPage: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const memberId = router.query.memberId as string | undefined;

	const { data, loading } = useQuery(GET_USER, {
		skip: !memberId || !router.isReady,
		variables: { userId: memberId },
		fetchPolicy: 'network-only',
	});

	const profile = data?.getUser;
	const isTechnician = profile?.userType === 'TECHNICIAN';

	const { data: followingsData } = useQuery(GET_USER_FOLLOWINGS, {
		skip: !memberId || isTechnician,
		variables: {
			input: {
				page: 1,
				limit: 1,
				search: { followerId: memberId },
			},
		},
		fetchPolicy: 'network-only',
	});

	const followingTotal = followingsData?.getUserFollowings?.metaCounter?.[0]?.total ?? profile?.followingCount ?? 0;
	const displayName = profile?.userFullName || profile?.userNickname || profile?.shopName || '';

	useEffect(() => {
		if (!router.isReady) return;
		if (!memberId) {
			router.replace('/').then();
			return;
		}
		if (user?._id && memberId === user._id) {
			router.replace(CLIENT_MY_PAGE).then();
		}
	}, [router.isReady, memberId, user?._id]);

	useEffect(() => {
		if (!profile || !memberId) return;
		if (profile.userType === 'TECHNICIAN') {
			router.replace(`/technicians/${memberId}`).then();
		}
	}, [profile, memberId, router]);

	const messageHandler = () => {
		if (!memberId) return;
		router.push(`/messages?peerId=${memberId}`);
	};

	if (!router.isReady || !memberId || loading || !profile) {
		return (
			<div className="fixora-member-page">
				<div className="container fixora-member">
					<p className="fixora-member__loading">{t('common.loading', 'Loading...')}</p>
				</div>
			</div>
		);
	}

	if (isTechnician) {
		return (
			<div className="fixora-member-page">
				<div className="container fixora-member">
					<p className="fixora-member__loading">{t('common.loading', 'Loading...')}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="fixora-member-page">
			<div className="container fixora-member">
				<div className="fixora-mypage__header fixora-member__header">
					<div className="fixora-mypage__identity">
						<img
							className="fixora-mypage__avatar"
							src={resolveProfileImageUrl(profile.userProfileImage)}
							alt=""
						/>
						<div className="fixora-mypage__identity-info">
							<strong className="fixora-mypage__name">{displayName}</strong>
							{profile.userNickname && profile.userNickname !== displayName && (
								<span className="fixora-member__nickname">@{profile.userNickname}</span>
							)}
							{profile.userLocation && (
								<span className="fixora-member__location">{profile.userLocation}</span>
							)}
							{profile.userBio && <p className="fixora-member__bio">{profile.userBio}</p>}
							{user?._id && user._id !== memberId && (
								<div className="fixora-member__actions">
									<FixoraButton variant="outline" onClick={messageHandler}>
										{t('messages.sendMessage', 'Message')}
									</FixoraButton>
								</div>
							)}
						</div>
					</div>

					<div className="fixora-mypage__stats">
						<div className="fixora-mypage__stat">
							<strong>{followingTotal}</strong>
							<span>{t('mypage.following')}</span>
						</div>
					</div>
				</div>

				<section className="fixora-member__reviews-section">
					<h2 className="fixora-member__section-title">{t('member.reviewsTitle', 'Reviews')}</h2>
					<p className="fixora-member__section-hint">
						{t('member.reviewsHint', 'Reviews left after completed repair bookings (BIZ-05).')}
					</p>
					{memberId && <CustomerReviewsSection userId={memberId} />}
				</section>
			</div>
		</div>
	);
};

export default withLayoutFull(MemberPage);
