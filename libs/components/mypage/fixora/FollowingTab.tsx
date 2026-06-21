import React from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { GET_USER_FOLLOWINGS } from '../../../../apollo/user/profile';
import { UNSUBSCRIBE } from '../../../../apollo/user/mutation';
import { userVar } from '../../../../apollo/store';
import { Following, BadgeLevel } from '../../../types/fixora/fixora';
import { resolveProfileImageUrl } from '../../../utils/profileImage';
import { sweetErrorHandling } from '../../../sweetAlert';

interface FollowingTabProps {
	userId?: string;
	readOnly?: boolean;
}

const badgeLabelKey = (level?: BadgeLevel) => {
	switch (level) {
		case 'PREMIUM_PRO':
			return 'mypage.badge.premiumPro';
		case 'VERIFIED':
			return 'mypage.badge.verified';
		default:
			return 'mypage.badge.new';
	}
};

const FollowingTab = ({ userId, readOnly = false }: FollowingTabProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const followerId = userId ?? user?._id;

	const { data, refetch } = useQuery(GET_USER_FOLLOWINGS, {
		skip: !followerId,
		variables: { input: { page: 1, limit: 50, search: { followerId } } },
		fetchPolicy: 'network-only',
	});

	const followings: Following[] = data?.getUserFollowings?.list ?? [];

	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const unfollow = async (technicianId: string) => {
		try {
			await unsubscribe({ variables: { input: technicianId } });
			await refetch();
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (!followings.length) {
		return (
			<div className="fixora-mypage__panel">
				<h2 className="fixora-mypage__panel-title">{t('mypage.tabs.following')}</h2>
				<p className="fixora-mypage__empty">{t('mypage.noFollowing')}</p>
			</div>
		);
	}

	return (
		<div className="fixora-mypage__panel">
			<h2 className="fixora-mypage__panel-title">{t('mypage.tabs.following')}</h2>
			<div className="fixora-mypage__following-list">
				{followings.map((following) => {
					const technician = following.followingData;
					if (!technician) return null;
					const displayName = technician.shopName || technician.userFullName || technician.userNickname || '';
					const articles = technician.userArticles ?? 0;
					const rating = technician.averageRating?.toFixed(2) ?? '—';

					return (
						<article key={following._id} className="fixora-mypage__following-card">
							<button
								type="button"
								className="fixora-mypage__following-card-main"
								onClick={() => router.push(`/technicians/${technician._id}`)}
							>
								<img
									className="fixora-mypage__following-avatar"
									src={resolveProfileImageUrl(technician.userProfileImage)}
									alt=""
								/>
								<div className="fixora-mypage__following-card-info">
									<strong>
										{displayName}
										{(technician.badgeLevel === 'PREMIUM_PRO' || technician.badgeLevel === 'VERIFIED') && (
											<WorkspacePremiumOutlinedIcon className="fixora-mypage__following-award" fontSize="inherit" />
										)}
									</strong>
									<span>
										{t(badgeLabelKey(technician.badgeLevel))} · {t('mypage.followingArticles', { count: articles })} · ★{rating}
									</span>
								</div>
							</button>
							{!readOnly ? (
								<button
									type="button"
									className="fixora-mypage__following-pill"
									onClick={() => unfollow(technician._id)}
								>
									<HowToRegIcon fontSize="inherit" />
									{t('mypage.followingLabel')}
								</button>
							) : null}
						</article>
					);
				})}
			</div>
		</div>
	);
};

export default FollowingTab;
