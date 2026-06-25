import React, { SyntheticEvent, useState } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import { AccordionDetails, Box, Stack, Typography } from '@mui/material';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { FAQ_CATEGORIES, FAQ_ITEMS, FaqCategory, faqPanelId } from './faqStructure';

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
	({ theme }) => ({
		border: `1px solid ${theme.palette.divider}`,
		'&:not(:last-child)': {
			borderBottom: 0,
		},
		'&:before': {
			display: 'none',
		},
	}),
);

const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary expandIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '1.4rem' }} />} {...props} />
))(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : '#fff',
	'& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
		transform: 'rotate(180deg)',
	},
	'& .MuiAccordionSummary-content': {
		marginLeft: theme.spacing(1),
	},
}));

const Faq = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [category, setCategory] = useState<FaqCategory>('booking');
	const firstPanel = faqPanelId('booking', FAQ_ITEMS.booking[0]);
	const [expanded, setExpanded] = useState<string | false>(firstPanel);

	const handleChange = (panel: string) => (_event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	if (device === 'mobile') {
		return <Typography className="cs-mobile-placeholder">{t('cs.mobilePlaceholder')}</Typography>;
	}

	return (
		<Stack className={'faq-content'}>
			<Box className={'categories'} component={'div'}>
				{FAQ_CATEGORIES.map((cat) => (
					<div
						key={cat}
						className={category === cat ? 'active' : ''}
						onClick={() => setCategory(cat)}
						role="button"
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') setCategory(cat);
						}}
					>
						{t(`cs.faq.categories.${cat}`)}
					</div>
				))}
			</Box>
			<Box className={'wrap'} component={'div'}>
				{FAQ_ITEMS[category].map((item) => {
					const panelId = faqPanelId(category, item);
					const subject = t(`cs.faq.${category}.${item}.subject`);
					const content = t(`cs.faq.${category}.${item}.content`);

					return (
						<Accordion expanded={expanded === panelId} onChange={handleChange(panelId)} key={panelId}>
							<AccordionSummary id={`${panelId}-header`} className="question" aria-controls={`${panelId}-content`}>
								<Typography className="badge" variant={'h4'}>
									Q
								</Typography>
								<Typography>{subject}</Typography>
							</AccordionSummary>
							<AccordionDetails>
								<Stack className={'answer flex-box'}>
									<Typography className="badge" variant={'h4'} color={'primary'}>
										A
									</Typography>
									<Typography>{content}</Typography>
								</Stack>
							</AccordionDetails>
						</Accordion>
					);
				})}
			</Box>
		</Stack>
	);
};

export default Faq;
