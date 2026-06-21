import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import FavoriteIcon from '@mui/icons-material/Favorite';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { GET_USER } from '../../../../apollo/user/query';
import { LIKE_TARGET_USER } from '../../../../apollo/user/mutation';
import { userVar } from '../../../../apollo/store';
import { BadgeLevel, User } from '../../../types/fixora/fixora';
import { resolveProfileImageUrl } from '../../../utils/profileImage';
import {
	getSavedTechnicianIds,
	setSavedTechnicianLiked,
	SAVED_TECHNICIANS_CHANGED,
} from '../../../utils/savedTechnicians';
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
	const client = useApolloClient();
	const user = useReactiveVar(userVar);
	const userId = user?._id;

	const [technicians, setTechnicians] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [likeTargetUser] = useMutation(LIKE_TARGET_USER);

	const loadSaved = useCallback(async () => {
		if (!userId) {
			setTechnicians([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		const ids = getSavedTechnicianIds(userId);
		if (!ids.length) {
			setTechnicians([]);
			setLoading(false);
			return;
		}

		try {
			const results = await Promise.all(
				ids.map(async (technicianId) => {
					const { data } = await client.query({
						query: GET_USER,
						variables: { userId: technicianId },
						fetchPolicy: 'network-only',
					});
					return data?.getUser as User | undefined;
				}),
			);
			const valid = results.filter(
				(tech): tech is User => !!tech?._id && tech.userType === 'TECHNICIAN',
			);
			setTechnicians(valid);
		} catch {
			setTechnicians([]);
		} finally {
			setLoading(false);
		}
	}, [client, userId]);

	useEffect(() => {
		loadSaved();
	}, [loadSaved]);

	useEffect(() => {
		if (!userId) return;

		const onChanged = (event: Event) => {
			const detail = (event as CustomEvent<{ userId?: string }>).detail;
			if (!detail?.userId || detail.userId === userId) loadSaved();
		};

		window.addEventListener(SAVED_TECHNICIANS_CHANGED, onChanged);
		return () => window.removeEventListener(SAVED_TECHNICIANS_CHANGED, onChanged);
	}, [loadSaved, userId]);

	const unsave = async (technicianId: string) => {
		if (!userId) return;
		try {
			const { data } = await likeTargetUser({ variables: { userId: technicianId } });
			const myFavorite = !!data?.likeTargetUser?.meLiked?.[0]?.myFavorite;
			setSavedTechnicianLiked(userId, technicianId, myFavorite);
			await loadSaved();
		} catch (err: unknown) {
			await sweetErrorHandling(err);
		}
	};

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
