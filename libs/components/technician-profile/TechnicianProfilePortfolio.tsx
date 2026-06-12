import React from 'react';
import { useTranslation } from 'next-i18next';

interface TechnicianProfilePortfolioProps {
	images?: string[];
}

const TechnicianProfilePortfolio = ({ images }: TechnicianProfilePortfolioProps) => {
	const { t } = useTranslation('common');

	if (!images?.length) {
		return <p className="fixora-tech-profile__empty">{t('technicianProfile.portfolio.empty')}</p>;
	}

	return (
		<div className="fixora-tech-profile__portfolio">
			{images.map((image, index) => (
				<div key={`${image}-${index}`} className="fixora-tech-profile__portfolio-item">
					<img src={image} alt="" />
				</div>
			))}
		</div>
	);
};

export default TechnicianProfilePortfolio;
