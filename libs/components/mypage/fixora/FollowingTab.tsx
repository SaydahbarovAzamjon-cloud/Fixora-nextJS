import React from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import StarIcon from '@mui/icons-material/Star';
import { GET_USER_FOLLOWINGS } from '../../../../apollo/user/profile';
import { UNSUBSCRIBE } from '../../../../apollo/user/mutation';
import { userVar } from '../../../../apollo/store';
import { Following } from '../../../types/fixora/fixora';
import { resolveProfileImageUrl } from '../../../utils/profileImage';
import { FixoraButton } from '../../ui';
import { sweetErrorHandling } from '../../../sweetAlert';

const FollowingTab = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const { data, refetch } = useQuery(GET_USER_FOLLOWINGS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 50, search: { followerId: user?._id } } },
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
		return <p className="fixora-mypage__empty">{t('mypage.noFollowing')}</p>;
	}

	return (
		<div className="fixora-mypage__following-list">
			{followings.map((following) => {
				const technician = following.followingData;
				if (!technician) return null;
				const displayName = technician.shopName || technician.userFullName || technician.userNickname || '';

				return (
					<div key={following._id} className="fixora-mypage__following">
						<button
							type="button"
							className="fixora-mypage__following-info"
							onClick={() => router.push(`/agent/detail?id=${technician._id}`)}
						>
							<img className="fixora-mypage__following-avatar" src={resolveProfileImageUrl(technician.userProfileImage)} alt="" />
							<div>
								<strong>{displayName}</strong>
								{technician.specialty && <span>{technician.specialty}</span>}
								<span className="fixora-mypage__following-rating">
									<StarIcon fontSize="inherit" />
									{technician.averageRating?.toFixed(1) ?? '—'} ({technician.reviewCount ?? 0})
								</span>
							</div>
						</button>
						<FixoraButton variant="outline" onClick={() => unfollow(technician._id)}>
							{t('mypage.unfollow')}
						</FixoraButton>
					</div>
				);
			})}
		</div>
	);
};

export default FollowingTab;
