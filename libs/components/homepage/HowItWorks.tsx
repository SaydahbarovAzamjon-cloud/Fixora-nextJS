import React from 'react';
import { Stack, Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import SearchIcon from '@mui/icons-material/Search';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const STEPS = [
	{ key: 'search', Icon: SearchIcon },
	{ key: 'match', Icon: PersonOutlineIcon },
	{ key: 'book', Icon: CalendarMonthOutlinedIcon },
	{ key: 'done', Icon: CheckCircleOutlineIcon },
] as const;

const HowItWorks = () => {
	const { t } = useTranslation('common');

	return (
		<Stack className="fixora-home-section fixora-home-how">
			<Stack className="container">
				<h2 className="fixora-home-how__title">{t('homepage.how.title')}</h2>
				<Box component="div" className="fixora-home-how__steps">
					{STEPS.map(({ key, Icon }, idx) => (
						<React.Fragment key={key}>
							<div className="fixora-home-how__step">
								<span className="fixora-home-how__number">{idx + 1}</span>
								<div className="fixora-home-how__icon">
									<Icon />
								</div>
								<strong>{t(`homepage.how.${key}.label`)}</strong>
								<p>{t(`homepage.how.${key}.desc`)}</p>
							</div>
							{idx < STEPS.length - 1 && <span className="fixora-home-how__arrow" aria-hidden="true" />}
						</React.Fragment>
					))}
				</Box>
			</Stack>
		</Stack>
	);
};

export default HowItWorks;
