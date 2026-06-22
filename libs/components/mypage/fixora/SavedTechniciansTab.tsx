import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import FavoriteIcon from '@mui/icons-material/Favorite';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { GET_USER_LIKED_TECHNICIANS } from '../../../../apollo/user/profile';
import { LIKE_TARGET_USER } from '../../../../apollo/user/mutation';
import { userVar } from '../../../../apollo/store';
import { BadgeLevel, TechnicianSummary } from '../../../types/fixora/fixora';
import { resolveProfileImageUrl } from '../../../utils/profileImage';
import { notifySavedTechniciansChanged } from '../../../utils/savedTechnicians';
import { sweetErrorHandling } from '../../../sweetAlert';

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

const SavedTechniciansTab = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const userId = user?._id;

	const { data, loading, refetch } = useQuery(GET_USER_LIKED_TECHNICIANS, {
		skip: !userId,
		variables: { input: { page: 1, limit: 50, sort: 'createdAt', direction: 'DESC' } },
		fetchPolicy: 'cache-and-network',
	});

	const [likeTargetUser] = useMutation(LIKE_TARGET_USER);

	const technicians: TechnicianSummary[] = data?.getUserLikedTechnicians?.list ?? [];

	const unsave = useCallback(
		async (technicianId: string) => {
			if (!userId) return;
			try {
				await likeTargetUser({ variables: { userId: technicianId } });
				notifySavedTechniciansChanged(userId);
				await refetch();
			} catch (err: unknown) {
				await sweetErrorHandling(err);
			}
		},
		[likeTargetUser, refetch, userId],
	);

	if (loading) return null;

	if (!technicians.length) {
		return (
			<div className="fixora-mypage__panel">
				<h2 className="fixora-mypage__panel-title">{t('mypage.tabs.savedTechnicians')}</h2>
				<p className="fixora-mypage__empty">{t('mypage.saved.empty')}</p>
			</div>
		);
	}

	return (
		<div className="fixora-mypage__panel">
			<h2 className="fixora-mypage__panel-title">{t('mypage.tabs.savedTechnicians')}</h2>
			<div className="fixora-mypage__following-list">
				{technicians.map((technician) => {
					const displayName =
						technician.shopName || technician.userFullName || technician.userNickname || '';
					const articles = technician.userArticles ?? 0;
					const rating = technician.averageRating?.toFixed(2) ?? '—';

					return (
						<article key={technician._id} className="fixora-mypage__following-card">
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
										{(technician.badgeLevel === 'PREMIUM_PRO' ||
											technician.badgeLevel === 'VERIFIED') && (
											<WorkspacePremiumOutlinedIcon
												className="fixora-mypage__following-award"
												fontSize="inherit"
											/>
										)}
									</strong>
									<span>
										{t(badgeLabelKey(technician.badgeLevel))} ·{' '}
										{t('mypage.followingArticles', { count: articles })} · ★{rating}
									</span>
								</div>
							</button>
							<button
								type="button"
								className="fixora-mypage__following-pill"
								onClick={() => unsave(technician._id)}
							>
								<FavoriteIcon fontSize="inherit" />
								{t('mypage.saved.remove')}
							</button>
						</article>
					);
				})}
			</div>
		</div>
	);
};

export default SavedTechniciansTab;
