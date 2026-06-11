import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StarIcon from '@mui/icons-material/Star';
import { TechnicianSummary } from '../../types/fixora/fixora';

interface TechnicianResultCardProps {
	technician: TechnicianSummary;
}

const TechnicianResultCard = ({ technician }: TechnicianResultCardProps) => {
	const { t } = useTranslation('common');

	const displayName = technician.shopName || technician.userNickname || technician.userFullName;
	const fromPrice = technician.services?.length
		? Math.min(...technician.services.map((service) => service.basePrice))
		: null;

	return (
		<article className="fixora-result-card">
			<img
				className="fixora-result-card__avatar"
				src={technician.userProfileImage || '/img/profile/defaultUser.svg'}
				alt=""
			/>

			<div className="fixora-result-card__main">
				<div className="fixora-result-card__name-row">
					<strong className="fixora-result-card__name">{displayName}</strong>
					<span className="fixora-result-card__rating">
						<StarIcon fontSize="inherit" />
						{technician.averageRating?.toFixed(1) ?? '—'}
						<em>({technician.reviewCount ?? 0})</em>
					</span>
					{technician.userLocation && (
						<span className="fixora-result-card__location">
							<LocationOnOutlinedIcon fontSize="inherit" />
							{technician.userLocation}
						</span>
					)}
				</div>

				{technician.specialty && <span className="fixora-result-card__specialty">{technician.specialty}</span>}

				<span className="fixora-result-card__jobs">
					{t('search.results.jobsCompleted', { total: technician.completedJobsCount ?? 0 })}
				</span>
			</div>

			<div className="fixora-result-card__aside">
				{fromPrice !== null && (
					<span className="fixora-result-card__price">{t('search.results.fromPrice', { price: fromPrice })}</span>
				)}
				<span className="fixora-result-card__response">{t('search.results.responseTime')}</span>
				<Link href={`/agent/detail?id=${technician._id}`} className="fixora-result-card__action">
					{t('search.results.viewProfile')}
				</Link>
			</div>
		</article>
	);
};

export default TechnicianResultCard;
