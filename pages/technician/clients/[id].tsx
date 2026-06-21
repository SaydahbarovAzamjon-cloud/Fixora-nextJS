import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useQuery, useReactiveVar } from '@apollo/client';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { technicianPageProps } from '../../../libs/i18n/technicianPageProps';
import { GET_USER } from '../../../apollo/user/query';
import { GET_USER_FOLLOWINGS } from '../../../apollo/user/profile';
import { userVar } from '../../../apollo/store';
import { FixoraButton } from '../../../libs/components/ui';
import { resolveProfileImageUrl } from '../../../libs/utils/profileImage';
import CustomerReviewsSection from '../../../libs/components/member/CustomerReviewsSection';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: await technicianPageProps(locale),
});

const TechnicianClientProfile: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const clientId = router.query.id as string | undefined;

	const { data, loading } = useQuery(GET_USER, {
		skip: !clientId || !router.isReady,
		variables: { userId: clientId },
		fetchPolicy: 'network-only',
	});

	const profile = data?.getUser;
	const isTechnician = profile?.userType === 'TECHNICIAN';

	const { data: followingsData } = useQuery(GET_USER_FOLLOWINGS, {
		skip: !clientId || isTechnician,
		variables: {
			input: {
				page: 1,
				limit: 1,
				search: { followerId: clientId },
			},
		},
		fetchPolicy: 'network-only',
	});

	const followingTotal = followingsData?.getUserFollowings?.metaCounter?.[0]?.total ?? profile?.followingCount ?? 0;
	const displayName = profile?.userFullName || profile?.userNickname || profile?.shopName || '';

	useEffect(() => {
		if (!router.isReady || !clientId) return;
		if (profile?.userType === 'TECHNICIAN') {
			router.replace(`/technicians/${clientId}`).then();
		}
	}, [router, router.isReady, clientId, profile?.userType]);

	const messageHandler = () => {
		if (!clientId) return;
		router.push(`/technician/messages?peerId=${clientId}`).then();
	};

	if (!router.isReady || !clientId || loading || !profile) {
		return (
			<div className="fixora-tech-client-page">
				<div className="fixora-member fixora-tech-client">
					<p className="fixora-member__loading">{t('common.loading', 'Loading...')}</p>
				</div>
			</div>
		);
	}

	if (isTechnician) {
		return (
			<div className="fixora-tech-client-page">
				<div className="fixora-member fixora-tech-client">
					<p className="fixora-member__loading">{t('common.loading', 'Loading...')}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="fixora-tech-client-page">
			<div className="fixora-member fixora-tech-client">
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
							{user?._id && user._id !== clientId && (
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
					<CustomerReviewsSection userId={clientId} />
				</section>
			</div>
		</div>
	);
};

export default withTechnicianLayout(TechnicianClientProfile);
