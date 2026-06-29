import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import { FixoraGlassCard } from '../ui';
import type { useDeviceImageUpload } from '../../hooks/useDeviceImageUpload';
import { MAX_DEVICE_IMAGES } from '../../utils/deviceImage';

type DeviceImageUploadApi = ReturnType<typeof useDeviceImageUpload>;

interface BookingDeviceImageUploadProps {
	upload: DeviceImageUploadApi;
}

const BookingDeviceImageUpload = ({ upload }: BookingDeviceImageUploadProps) => {
	const { t } = useTranslation('common');
	const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

	const closeLightbox = useCallback(() => setLightboxUrl(null), []);

	useEffect(() => {
		if (!lightboxUrl) return undefined;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closeLightbox();
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [closeLightbox, lightboxUrl]);

	return (
		<FixoraGlassCard className="fixora-booking__card fixora-booking__card--device-images">
			<div className="fixora-input fixora-booking__device-image">
				<span className="fixora-input__label">{t('booking.device.image')}</span>
				<span className="fixora-booking__text fixora-booking__text--muted">
					{t('booking.device.imageHint', { count: MAX_DEVICE_IMAGES })}
				</span>

				<div className="fixora-booking__device-image-grid">
					{upload.images.map((image, index) => (
						<div key={image.id} className="fixora-booking__device-image-preview">
							<button
								type="button"
								className="fixora-booking__device-image-preview-btn"
								onClick={() => setLightboxUrl(image.previewUrl)}
								aria-label={t('booking.device.imageEnlarge', {
									index: index + 1,
								})}
							>
								<img src={image.previewUrl} alt="" width={120} height={120} decoding="async" />
							</button>
							<button
								type="button"
								className="fixora-booking__device-image-replace"
								onClick={() => upload.openReplacePicker(image.id)}
								aria-label={t('booking.device.imageReplace')}
							>
								<SwapHorizOutlinedIcon fontSize="inherit" />
							</button>
							<button
								type="button"
								className="fixora-booking__device-image-remove"
								onClick={() => upload.removeImage(image.id)}
								aria-label={t('booking.device.imageRemove')}
							>
								<CloseOutlinedIcon fontSize="small" />
							</button>
						</div>
					))}

					{upload.canAddMore && (
						<button
							type="button"
							className="fixora-booking__device-image-drop fixora-booking__device-image-drop--tile"
							onClick={upload.openPicker}
						>
							<CloudUploadOutlinedIcon fontSize="small" />
							<span>{t('booking.device.imageUpload')}</span>
						</button>
					)}
				</div>

				<input
					ref={upload.fileRef}
					type="file"
					accept="image/png,image/jpeg,image/jpg,image/webp"
					multiple
					className="fixora-booking__device-image-input"
					onChange={upload.pickFiles}
				/>
			</div>

			{lightboxUrl && (
				<div
					className="fixora-booking__image-lightbox"
					role="dialog"
					aria-modal="true"
					aria-label={t('booking.device.image')}
					onClick={closeLightbox}
				>
					<button
						type="button"
						className="fixora-booking__image-lightbox-close"
						onClick={closeLightbox}
						aria-label={t('booking.detail.photoClose')}
					>
						<CloseOutlinedIcon />
					</button>
					<div className="fixora-booking__image-lightbox-body" onClick={(event) => event.stopPropagation()}>
						<img src={lightboxUrl} alt="" />
					</div>
				</div>
			)}
		</FixoraGlassCard>
	);
};

export default BookingDeviceImageUpload;
