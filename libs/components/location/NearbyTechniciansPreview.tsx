import React, { useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import StarIcon from '@mui/icons-material/Star';
import { GET_TECHNICIANS } from '../../../apollo/user/query';
import { DEFAULT_GEO_SEARCH_RADIUS_KM, type MapPoint } from '../../kakao-maps';
import { TechnicianSummary } from '../../types/fixora/fixora';
import {
	distanceKmBetween,
	filterTechniciansWithinRadius,
	formatDistanceKm,
	technicianDisplayName,
} from '../../utils/technicianMap';
import { prepareTechniciansQueryInput, serializeSearchPageQueryInput } from '../../utils/technicianSearch';
import { resolveProfileImageUrl } from '../../utils/profileImage';

interface NearbyTechniciansPreviewProps {
	point: MapPoint | null;
}

const PREVIEW_LIMIT = 5;
const SEARCH_LIMIT = 20;

const NearbyTechniciansPreview = ({ point }: NearbyTechniciansPreviewProps) => {
	const { t } = useTranslation('common');

	const queryInput = useMemo(() => {
		if (!point) return null;
		return prepareTechniciansQueryInput({
			page: 1,
			limit: SEARCH_LIMIT,
			sort: 'averageRating',
			direction: 'DESC',
			search: {
				latitude: point.lat,
				longitude: point.lng,
				radiusKm: DEFAULT_GEO_SEARCH_RADIUS_KM,
				isOnline: null,
			},
		});
	}, [point]);

	const { data, loading } = useQuery(GET_TECHNICIANS, {
		skip: !queryInput,
		variables: { input: queryInput! },
		fetchPolicy: 'cache-and-network',
	});

	const searchHref = useMemo(() => {
		if (!point) return '/search';
		return `/search?input=${serializeSearchPageQueryInput({
			page: 1,
			limit: 10,
			sort: 'averageRating',
			direction: 'DESC',
			search: {
				latitude: point.lat,
				longitude: point.lng,
				radiusKm: DEFAULT_GEO_SEARCH_RADIUS_KM,
				isOnline: null,
			},
		})}`;
	}, [point]);

	const technicians = useMemo(() => {
		if (!point) return [];
		const list = (data?.getTechnicians?.list ?? []) as TechnicianSummary[];
		const nearby = filterTechniciansWithinRadius(list, point, DEFAULT_GEO_SEARCH_RADIUS_KM);
		return nearby
			.map((tech) => ({
				tech,
				distanceKm: distanceKmBetween(point, {
					lat: tech.shopLatitude,
					lng: tech.shopLongitude,
				}),
			}))
			.sort((a, b) => a.distanceKm - b.distanceKm)
			.slice(0, PREVIEW_LIMIT);
	}, [data, point]);

	if (!point) return null;

	return (
		<aside className="fixora-mypage__nearby-techs">
			<div className="fixora-mypage__nearby-techs-head">
				<h3>{t('mypage.settings.nearbyTechniciansTitle')}</h3>
				<p>{t('mypage.settings.nearbyTechniciansSub', { radius: DEFAULT_GEO_SEARCH_RADIUS_KM })}</p>
			</div>

			{loading && !technicians.length ? (
				<p className="fixora-mypage__nearby-techs-hint">{t('mypage.settings.nearbyTechniciansLoading')}</p>
			) : !technicians.length ? (
				<p className="fixora-mypage__nearby-techs-hint">{t('mypage.settings.nearbyTechniciansEmpty')}</p>
			) : (
				<ul className="fixora-mypage__nearby-techs-list">
					{technicians.map(({ tech, distanceKm }) => (
						<li key={tech._id}>
							<Link href={`/technicians/${tech._id}`} className="fixora-mypage__nearby-techs-item">
								<img
									className="fixora-mypage__nearby-techs-avatar"
									src={resolveProfileImageUrl(tech.userProfileImage)}
									alt=""
								/>
								<div className="fixora-mypage__nearby-techs-meta">
									<strong>{technicianDisplayName(tech)}</strong>
									<span>
										{tech.averageRating != null && (
											<>
												<StarIcon fontSize="inherit" />
												{tech.averageRating.toFixed(1)}
												{' · '}
											</>
										)}
										{formatDistanceKm(distanceKm)}
									</span>
								</div>
							</Link>
						</li>
					))}
				</ul>
			)}

			<Link href={searchHref} className="fixora-mypage__nearby-techs-link">
				{t('mypage.settings.nearbyTechniciansViewAll')}
			</Link>
		</aside>
	);
};

export default NearbyTechniciansPreview;
