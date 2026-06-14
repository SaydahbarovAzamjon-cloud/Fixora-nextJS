import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import CloseIcon from '@mui/icons-material/Close';

interface RequestDetailProps {
	requestId?: string;
	deviceModel?: string;
	deviceType?: string;
	color?: string;
	storage?: string;
	problemDescription?: string;
	preferredTime?: string;
	price?: number;
	customerName?: string;
	customerImage?: string;
	onRespond?: () => void;
	onDecline?: () => void;
}

const RequestDetail: React.FC<RequestDetailProps> = ({
	requestId,
	deviceModel = 'iPhone 13',
	deviceType = 'iPhone',
	color = 'Space Gray',
	storage = '256GB',
	problemDescription = 'My iPhone 13 screen is cracked and has some dead pixels in the top left corner. I need it fixed ASAP.',
	preferredTime = 'Today 10:30 AM',
	price = 35,
	customerName = 'John D.',
	customerImage,
	onRespond,
	onDecline,
}) => {
	const { t } = useTranslation('common');
	const [isResponding, setIsResponding] = useState(false);

	if (!requestId) {
		return (
			<div className="fixora-request-detail fixora-request-detail--empty">
				<div className="fixora-request-detail__empty-state">
					<p>Select a request to view details</p>
				</div>
			</div>
		);
	}

	const handleRespond = () => {
		setIsResponding(true);
		onRespond?.();
		setTimeout(() => setIsResponding(false), 2000);
	};

	return (
		<div className="fixora-request-detail">
			{/* Header */}
			<div className="fixora-request-detail__header">
				<h3 className="fixora-request-detail__title">Request Details</h3>
			</div>

			{/* Device Info */}
			<div className="fixora-request-detail__section">
				<h4 className="fixora-request-detail__section-title">Device</h4>
				<div className="fixora-request-detail__device-info">
					<div className="fixora-device-spec">
						<span className="fixora-device-spec__label">Device</span>
						<span className="fixora-device-spec__value">
							{deviceType}
						</span>
					</div>
					<div className="fixora-device-spec">
						<span className="fixora-device-spec__label">Model</span>
						<span className="fixora-device-spec__value">
							{deviceModel}
						</span>
					</div>
					<div className="fixora-device-spec">
						<span className="fixora-device-spec__label">Color</span>
						<span className="fixora-device-spec__value">{color}</span>
					</div>
					<div className="fixora-device-spec">
						<span className="fixora-device-spec__label">Storage</span>
						<span className="fixora-device-spec__value">{storage}</span>
					</div>
				</div>
			</div>

			{/* Problem Description */}
			<div className="fixora-request-detail__section">
				<h4 className="fixora-request-detail__section-title">Problem</h4>
				<p className="fixora-request-detail__description">
					{problemDescription}
				</p>
			</div>

			{/* Preferred Time */}
			<div className="fixora-request-detail__section">
				<h4 className="fixora-request-detail__section-title">Preferred Time</h4>
				<p className="fixora-request-detail__time">⏰ {preferredTime}</p>
			</div>

			{/* Damage Photos */}
			<div className="fixora-request-detail__section">
				<h4 className="fixora-request-detail__section-title">Damage Photos</h4>
				<div className="fixora-request-detail__photos">
					<div className="fixora-damage-photo">📷</div>
					<div className="fixora-damage-photo">📷</div>
					<div className="fixora-damage-photo">📷</div>
				</div>
			</div>

			{/* Customer Info */}
			<div className="fixora-request-detail__section">
				<h4 className="fixora-request-detail__section-title">Customer</h4>
				<div className="fixora-customer-info">
					<div className="fixora-customer-info__avatar">
						{customerImage ? (
							<img src={customerImage} alt={customerName} />
						) : (
							'JD'
						)}
					</div>
					<div className="fixora-customer-info__content">
						<div className="fixora-customer-info__name">
							{customerName}
						</div>
						<div className="fixora-customer-info__rating">
							⭐ 4.5 (125 reviews)
						</div>
					</div>
				</div>
			</div>

			{/* Price & Actions */}
			<div className="fixora-request-detail__footer">
				<div className="fixora-request-detail__price-section">
					<span className="fixora-request-detail__price-label">
						Estimated Price
					</span>
					<span className="fixora-request-detail__price-value">
						${price}
					</span>
				</div>

				<div className="fixora-request-detail__actions">
					<button
						className="fixora-request-detail__btn fixora-request-detail__btn--respond"
						onClick={handleRespond}
						disabled={isResponding}
					>
						<ThumbUpAltIcon />
						{isResponding ? 'Responding...' : 'Respond'}
					</button>
					<button
						className="fixora-request-detail__btn fixora-request-detail__btn--decline"
						onClick={onDecline}
					>
						<CloseIcon />
						Decline
					</button>
				</div>
			</div>
		</div>
	);
};

export default RequestDetail;
