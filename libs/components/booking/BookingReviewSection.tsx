import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import StarIcon from '@mui/icons-material/Star';
import { CREATE_REVIEW } from '../../../apollo/user/mutation';
import { GET_BOOKING_REVIEW } from '../../../apollo/user/query';
import { FixoraButton, FixoraGlassCard } from '../ui';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import type { BookingReview } from '../../types/fixora/fixora';

interface BookingReviewSectionProps {
	bookingId: string;
	bookingStatus: string;
	existingReview?: BookingReview | null;
	onSubmitted?: () => void;
}

type RatingField = 'communication' | 'repairQuality' | 'repairSpeed';

const RATING_FIELDS: RatingField[] = ['communication', 'repairQuality', 'repairSpeed'];

const BookingReviewSection = ({ bookingId, bookingStatus, existingReview, onSubmitted }: BookingReviewSectionProps) => {
	const { t } = useTranslation('common');
	const [communication, setCommunication] = useState(5);
	const [repairQuality, setRepairQuality] = useState(5);
	const [repairSpeed, setRepairSpeed] = useState(5);
	const [reviewContent, setReviewContent] = useState('');
	const [loading, setLoading] = useState(false);
	const [createReview] = useMutation(CREATE_REVIEW);

	if (bookingStatus !== 'COMPLETED') return null;

	if (existingReview) {
		return (
			<FixoraGlassCard className="fixora-booking-detail__review">
				<h3>{t('review.booking.submittedTitle')}</h3>
				<div className="fixora-booking-detail__review-ratings">
					{RATING_FIELDS.map((field) => (
						<div key={field} className="fixora-booking-detail__review-row">
							<span>{t(`review.booking.${field}`)}</span>
							<strong>
								<StarIcon fontSize="inherit" /> {existingReview[field].toFixed(1)}
							</strong>
						</div>
					))}
				</div>
				{existingReview.reviewContent && <p className="fixora-booking-detail__review-text">{existingReview.reviewContent}</p>}
			</FixoraGlassCard>
		);
	}

	const setRating = (field: RatingField, value: number) => {
		if (field === 'communication') setCommunication(value);
		if (field === 'repairQuality') setRepairQuality(value);
		if (field === 'repairSpeed') setRepairSpeed(value);
	};

	const ratings: Record<RatingField, number> = { communication, repairQuality, repairSpeed };

	const handleSubmit = async () => {
		setLoading(true);
		try {
			await createReview({
				variables: {
					input: {
						bookingId,
						communication,
						repairQuality,
						repairSpeed,
						reviewContent: reviewContent.trim() || undefined,
					},
				},
				refetchQueries: [{ query: GET_BOOKING_REVIEW, variables: { bookingId } }],
				awaitRefetchQueries: true,
			});
			await sweetTopSmallSuccessAlert(t('review.booking.success'), 1400);
			onSubmitted?.();
		} catch (err) {
			await sweetErrorHandling(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<FixoraGlassCard className="fixora-booking-detail__review">
			<h3>{t('review.booking.title')}</h3>
			<p className="fixora-booking-detail__review-hint">{t('review.booking.hint')}</p>

			{RATING_FIELDS.map((field) => (
				<div key={field} className="fixora-booking-detail__rating-field">
					<span>{t(`review.booking.${field}`)}</span>
					<div className="fixora-booking-detail__stars" role="group" aria-label={t(`review.booking.${field}`)}>
						{[1, 2, 3, 4, 5].map((star) => (
							<button
								key={star}
								type="button"
								className={`fixora-booking-detail__star${ratings[field] >= star ? ' fixora-booking-detail__star--active' : ''}`}
								onClick={() => setRating(field, star)}
								aria-label={`${star}`}
							>
								<StarIcon fontSize="small" />
							</button>
						))}
					</div>
				</div>
			))}

			<label className="fixora-input__label" htmlFor="reviewContent">
				{t('review.booking.content')}
			</label>
			<textarea
				id="reviewContent"
				className="fixora-booking-detail__review-textarea"
				placeholder={t('review.booking.contentPlaceholder')}
				value={reviewContent}
				onChange={(e) => setReviewContent(e.target.value)}
				rows={3}
			/>

			<FixoraButton variant="primary" disabled={loading} onClick={handleSubmit}>
				{t('review.booking.submit')}
			</FixoraButton>
		</FixoraGlassCard>
	);
};

export default BookingReviewSection;
