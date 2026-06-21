import React from 'react';
import { useTranslation } from 'next-i18next';

interface BookingServiceTypeOptionsProps {
	/** Card grid on booking form; inline chips on technician profile. */
	variant?: 'card' | 'inline';
}

const BookingServiceTypeOptions = ({ variant = 'card' }: BookingServiceTypeOptionsProps) => {
	const { t } = useTranslation('common');

	if (variant === 'inline') {
		return (
			<div className="fixora-booking-service-types fixora-booking-service-types--inline">
				<span className="fixora-booking-service-types__label">{t('technicianProfile.sidebar.serviceTypes')}</span>
				<div className="fixora-booking-service-types__chips">
					<span className="fixora-booking-service-types__chip fixora-booking-service-types__chip--active">
						{t('booking.details.typeShopVisit')}
					</span>
					<span
						className="fixora-booking-service-types__chip fixora-booking-service-types__chip--disabled"
						aria-disabled="true"
					>
						{t('booking.details.typeOnSite')}
						<span className="fixora-booking-service-types__badge">{t('booking.badge.comingSoon')}</span>
					</span>
				</div>
			</div>
		);
	}

	return (
		<div className="fixora-booking-service-types">
			<h3 className="fixora-booking-service-types__heading">{t('booking.details.serviceTypeHeading')}</h3>
			<div className="fixora-booking__type-options">
				<div className="fixora-booking__type-option fixora-booking__type-option--active" aria-current="true">
					<strong>{t('booking.details.typeShopVisit')}</strong>
					<span>{t('booking.details.typeShopVisitDesc')}</span>
				</div>
				<div
					className="fixora-booking__type-option fixora-booking__type-option--disabled"
					aria-disabled="true"
				>
					<strong>
						{t('booking.details.typeOnSite')}
						<span className="fixora-booking-service-types__badge">{t('booking.badge.comingSoon')}</span>
					</strong>
					<span>{t('booking.details.typeOnSiteDesc')}</span>
				</div>
			</div>
		</div>
	);
};

export default BookingServiceTypeOptions;
