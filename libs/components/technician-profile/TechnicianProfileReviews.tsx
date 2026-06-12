import React from 'react';
import { useTranslation } from 'next-i18next';
import StarIcon from '@mui/icons-material/Star';
import { TechnicianReview } from '../../types/fixora/fixora';

interface TechnicianProfileReviewsProps {
	reviews: TechnicianReview[];
}

const averageScore = (review: TechnicianReview) =>
	((review.repairQuality + review.repairSpeed + review.communication) / 3).toFixed(1);

const TechnicianProfileReviews = ({ reviews }: TechnicianProfileReviewsProps) => {
	const { t } = useTranslation('common');

	if (!reviews.length) {
		return <p className="fixora-tech-profile__empty">{t('technicianProfile.reviews.empty')}</p>;
	}

	return (
		<ul className="fixora-tech-profile__reviews">
			{reviews.map((review) => (
				<li key={review._id} className="fixora-tech-profile__review-item">
					<div className="fixora-tech-profile__review-head">
						<span>
							<StarIcon fontSize="inherit" />
							{averageScore(review)}
						</span>
						<time>{new Date(review.createdAt).toLocaleDateString()}</time>
					</div>
					{review.reviewContent && <p>{review.reviewContent}</p>}
				</li>
			))}
		</ul>
	);
};

export default TechnicianProfileReviews;
