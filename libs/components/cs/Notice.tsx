import React from 'react';
import { Stack, Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const NOTICE_IDS = ['launch', 'kakaopay', 'verification'] as const;

const Notice = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	if (device === 'mobile') {
		return <div>{t('cs.mobilePlaceholder')}</div>;
	}

	return (
		<Stack className={'notice-content'}>
			<span className={'title'}>{t('cs.notice.title')}</span>
			<Stack className={'main'}>
				<Box component={'div'} className={'top'}>
					<span>{t('cs.notice.colNumber')}</span>
					<span>{t('cs.notice.colTitle')}</span>
					<span>{t('cs.notice.colDate')}</span>
				</Box>
				<Stack className={'bottom'}>
					{NOTICE_IDS.map((id, index) => {
						const isEvent = id === 'launch';

						return (
							<div className={`notice-card ${isEvent ? 'event' : ''}`} key={id}>
								{isEvent ? <div>{t('cs.notice.eventBadge')}</div> : <span className={'notice-number'}>{index + 1}</span>}
								<span className={'notice-title'}>{t(`cs.notice.items.${id}.title`)}</span>
								<span className={'notice-date'}>{t(`cs.notice.items.${id}.date`)}</span>
							</div>
						);
					})}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default Notice;
