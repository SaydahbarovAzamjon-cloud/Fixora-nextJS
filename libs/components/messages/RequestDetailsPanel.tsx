import React from 'react';
import Link from 'next/link';
import Moment from 'react-moment';
import { useTranslation } from 'next-i18next';
import { Booking, Device } from '../../types/fixora/fixora';
import { FixoraButton } from '../ui';

interface RequestDetailsPanelProps {
	booking?: Booking | null;
	device?: Device | null;
	loading?: boolean;
}

const RequestDetailsPanel = ({ booking, device, loading }: RequestDetailsPanelProps) => {
	const { t } = useTranslation('common');

	if (loading) {
		return (
			<div className="fixora-messages__details">
				<h2 className="fixora-messages__details-title">{t('messages.requestDetails.title')}</h2>
				<p className="fixora-messages__empty">{t('messages.loading')}</p>
			</div>
		);
	}

	if (!booking) return null;

	const price = booking.finalPrice ?? booking.estimatedPrice;

	return (
		<div className="fixora-messages__details">
			<h2 className="fixora-messages__details-title">{t('messages.requestDetails.title')}</h2>

			<div className="fixora-messages__details-device">
				{device?.deviceImage && <img src={device.deviceImage} alt="" />}
				<div>
					<strong>
						{device ? `${t(`booking.device.categories.${device.deviceCategory}`)} ${device.deviceModel}` : booking.problemTitle}
					</strong>
					<span>{booking.problemTitle}</span>
				</div>
			</div>

			<dl className="fixora-messages__details-list">
				<div>
					<dt>{t('messages.requestDetails.status')}</dt>
					<dd>
						<span className={`fixora-messages__status fixora-messages__status--${booking.bookingStatus.toLowerCase()}`}>
							{t(`booking.status.${booking.bookingStatus}`)}
						</span>
					</dd>
				</div>

				{booking.bookingDate && (
					<>
						<div>
							<dt>{t('messages.requestDetails.date')}</dt>
							<dd>
								<Moment format="MMMM D, YYYY">{booking.bookingDate}</Moment>
							</dd>
						</div>
						<div>
							<dt>{t('messages.requestDetails.time')}</dt>
							<dd>
								<Moment format="h:mm A">{booking.bookingDate}</Moment>
							</dd>
						</div>
					</>
				)}

				{price != null && (
					<div>
						<dt>{t('messages.requestDetails.price')}</dt>
						<dd>${price}</dd>
					</div>
				)}
			</dl>

			<Link href="/mypage" className="fixora-messages__details-cta">
				<FixoraButton fullWidth>{t('messages.requestDetails.viewRequest')}</FixoraButton>
			</Link>
		</div>
	);
};

export default RequestDetailsPanel;
