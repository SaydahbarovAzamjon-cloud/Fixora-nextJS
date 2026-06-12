import React from 'react';
import { useTranslation } from 'next-i18next';
import { TechnicianProfile } from '../../types/fixora/fixora';

interface TechnicianProfileServicesProps {
	services: TechnicianProfile['services'];
}

const TechnicianProfileServices = ({ services }: TechnicianProfileServicesProps) => {
	const { t } = useTranslation('common');

	if (!services?.length) {
		return <p className="fixora-tech-profile__empty">{t('technicianProfile.services.empty')}</p>;
	}

	return (
		<ul className="fixora-tech-profile__services">
			{services.map((service) => (
				<li key={service.title} className="fixora-tech-profile__service-item">
					<span>{service.title}</span>
					<strong>{t('technicianProfile.services.fromPrice', { price: service.basePrice })}</strong>
				</li>
			))}
		</ul>
	);
};

export default TechnicianProfileServices;
