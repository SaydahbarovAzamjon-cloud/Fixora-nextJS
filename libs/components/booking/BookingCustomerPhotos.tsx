import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HideImageOutlinedIcon from '@mui/icons-material/HideImageOutlined';

interface BookingCustomerPhotosProps {
	imageUrls: string[];
	variant?: 'section' | 'embedded';
}

const BookingCustomerPhotos = ({ imageUrls, variant = 'section' }: BookingCustomerPhotosProps) => {
	const { t } = useTranslation('common');
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const closeModal = useCallback(() => setActiveIndex(null), []);

	useEffect(() => {
		if (activeIndex == null) return undefined;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closeModal();
			if (event.key === 'ArrowRight') {
				setActiveIndex((current) =>
					current == null ? current : Math.min(current + 1, imageUrls.length - 1),
				);
			}
			if (event.key === 'ArrowLeft') {
				setActiveIndex((current) => (current == null ? current : Math.max(current - 1, 0)));
			}
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [activeIndex, closeModal, imageUrls.length]);

	if (imageUrls.length === 0) {
		if (variant === 'embedded') {
			return (
				<div className="fixora-booking-detail__device-empty">
					<HideImageOutlinedIcon aria-hidden="true" />
					<p>{t('booking.detail.noPhotosUploaded')}</p>
				</div>
			);
		}
		return null;
	}

	const track = (
		<div className="fixora-booking-detail__photos-track" role="list">
				{imageUrls.map((url, index) => (
					<button
						key={`${url}-${index}`}
						type="button"
						className="fixora-booking-detail__photo-item"
						onClick={() => setActiveIndex(index)}
						aria-label={t('booking.detail.photoOpen', { index: index + 1 })}
					>
						<img src={url} alt="" loading="lazy" />
					</button>
				))}
		</div>
	);

	const modal = activeIndex != null && (
				<div
					className="fixora-booking-detail__photo-modal"
					role="dialog"
					aria-modal="true"
					aria-label={t('booking.detail.customerPhotos')}
					onClick={closeModal}
				>
					<button
						type="button"
						className="fixora-booking-detail__photo-modal-close"
						onClick={closeModal}
						aria-label={t('booking.detail.photoClose')}
					>
						<CloseIcon />
					</button>
					{imageUrls.length > 1 && activeIndex > 0 && (
						<button
							type="button"
							className="fixora-booking-detail__photo-modal-nav fixora-booking-detail__photo-modal-nav--prev"
							onClick={(event) => {
								event.stopPropagation();
								setActiveIndex((current) => (current == null ? current : current - 1));
							}}
							aria-label={t('booking.detail.photoPrev')}
						>
							<ChevronLeftIcon />
						</button>
					)}
					{imageUrls.length > 1 && activeIndex < imageUrls.length - 1 && (
						<button
							type="button"
							className="fixora-booking-detail__photo-modal-nav fixora-booking-detail__photo-modal-nav--next"
							onClick={(event) => {
								event.stopPropagation();
								setActiveIndex((current) => (current == null ? current : current + 1));
							}}
							aria-label={t('booking.detail.photoNext')}
						>
							<ChevronRightIcon />
						</button>
					)}
					<div
						className="fixora-booking-detail__photo-modal-body"
						onClick={(event) => event.stopPropagation()}
					>
						<img src={imageUrls[activeIndex]} alt="" />
					</div>
				</div>
	);

	if (variant === 'embedded') {
		return (
			<>
				{track}
				{modal}
			</>
		);
	}

	return (
		<section className="fixora-booking-detail__photos">
			<h2>{t('booking.detail.customerPhotos')}</h2>
			{track}
			{modal}
		</section>
	);
};

export default BookingCustomerPhotos;
