import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Stack } from '@mui/material';
import { useLazyQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import ArrowForward from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import TabletMacIcon from '@mui/icons-material/TabletMac';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WatchIcon from '@mui/icons-material/Watch';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import MemoryIcon from '@mui/icons-material/Memory';
import CableIcon from '@mui/icons-material/Cable';
import MouseIcon from '@mui/icons-material/Mouse';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { HERO_REPAIR_SEARCH } from '../../../apollo/user/hero';
import { FixoraButton } from '../ui';
import { useFixoraTheme } from '../theme/FixoraThemeProvider';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import type { HeroRecommendation } from './HeroRecommendedCarousel';

const HeroRecommendedCarousel = dynamic(() => import('./HeroRecommendedCarousel'), {
	ssr: false,
});

const CATEGORY_CHIPS = [
	{ key: 'iphone', Icon: PhoneIphoneIcon },
	{ key: 'macbook', Icon: LaptopMacIcon },
	{ key: 'ipad', Icon: TabletMacIcon },
	{ key: 'battery', Icon: BatteryAlertIcon },
	{ key: 'screen', Icon: SmartphoneIcon },
	{ key: 'water', Icon: WaterDropIcon },
] as const;

const TRUST_KEYS = ['experts', 'reviews', 'service', 'payments'] as const;

const FLOATING_DEVICES = [
	{ key: 'iphone', Icon: PhoneIphoneIcon },
	{ key: 'macbook', Icon: LaptopMacIcon },
	{ key: 'ipad', Icon: TabletMacIcon },
	{ key: 'watch', Icon: WatchIcon },
	{ key: 'airpods', Icon: HeadphonesIcon },
	{ key: 'battery', Icon: BatteryAlertIcon },
	{ key: 'chip', Icon: MemoryIcon },
	{ key: 'cable', Icon: CableIcon },
	{ key: 'mouse', Icon: MouseIcon },
	{ key: 'keyboard', Icon: KeyboardIcon },
] as const;

const HeroRepairSearch = () => {
	const { t } = useTranslation('common');
	const { mode } = useFixoraTheme();
	const router = useRouter();
	const [problemText, setProblemText] = useState('');
	const [classification, setClassification] = useState<any>(null);
	const [recommendations, setRecommendations] = useState<HeroRecommendation[]>([]);

	const [searchHero, { loading }] = useLazyQuery(HERO_REPAIR_SEARCH, {
		fetchPolicy: 'network-only',
		onCompleted: (data) => {
			setClassification(data?.heroRepairSearch?.classification ?? null);
			setRecommendations(data?.heroRepairSearch?.recommendations ?? []);
		},
		onError: (err) => {
			sweetMixinErrorAlert(err.message);
		},
	});

	const runSearch = (text: string) => {
		const trimmed = text.trim();
		if (trimmed.length < 3) return;
		searchHero({ variables: { input: { problemText: trimmed, limit: 5 } } });
	};

	const handleChipClick = (key: string) => {
		const text = t(`hero.chips.${key}.query`);
		setProblemText(text);
		runSearch(text);
	};

	const handleFindTechnician = () => {
		if (problemText.trim().length >= 3) {
			runSearch(problemText);
		} else {
			router.push('/search');
		}
	};

	const deviceImgSrc =
		mode === 'light' ? '/img/heroSection/bothDevice1-light.png' : '/img/heroSection/bothDevice1.png';

	return (
		<Stack className="fixora-hero">
			<div className="fixora-hero__scene" aria-hidden="true">
				<div className="fixora-hero__device-backdrop">
					<span className="fixora-hero__device-glow" />
					<img src={deviceImgSrc} alt="" className="fixora-hero__device-img" />
				</div>
				<span className="fixora-hero__particle fixora-hero__particle--1" />
				<span className="fixora-hero__particle fixora-hero__particle--2" />
				<span className="fixora-hero__particle fixora-hero__particle--3" />
				<span className="fixora-hero__particle fixora-hero__particle--4" />
				<span className="fixora-hero__particle fixora-hero__particle--5" />
				<span className="fixora-hero__particle fixora-hero__particle--6" />
				<span className="fixora-hero__particle fixora-hero__particle--7" />
				<span className="fixora-hero__particle fixora-hero__particle--8" />
				<span className="fixora-hero__particle fixora-hero__particle--9" />
				{FLOATING_DEVICES.map(({ key, Icon }) => (
					<span key={key} className={`fixora-hero__float-device fixora-hero__float-device--${key}`}>
						<Icon fontSize="inherit" />
					</span>
				))}
			</div>
			<div className="fixora-hero__content">
				<span className="fixora-hero__eyebrow">
					{t('hero.eyebrow')} <AutoAwesomeIcon fontSize="inherit" />
				</span>
				<h1 className="fixora-hero__title">
					{t('hero.titleBefore')} <em>{t('hero.titleAccent')}</em>
				</h1>
				<p className="fixora-hero__subtitle">{t('hero.subtitle')}</p>

				<div className="fixora-hero__search-bar">
					<AutoAwesomeIcon className="fixora-hero__search-icon" />
					<input
						className="fixora-hero__search-input"
						placeholder={t('hero.placeholder')}
						value={problemText}
						onChange={(e) => setProblemText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') runSearch(problemText);
						}}
					/>
					<button
						type="button"
						className="fixora-hero__search-submit"
						disabled={loading}
						onClick={() => runSearch(problemText)}
						aria-label={t('hero.search')}
					>
						<ArrowForward fontSize="small" />
					</button>
				</div>

				<div className="fixora-hero__categories">
					{CATEGORY_CHIPS.map(({ key, Icon }) => (
						<button
							key={key}
							type="button"
							className="fixora-hero__category"
							onClick={() => handleChipClick(key)}
						>
							<Icon fontSize="inherit" />
							{t(`hero.chips.${key}.label`)}
						</button>
					))}
				</div>

				<div className="fixora-hero__cta-wrap">
					<FixoraButton
						variant="primary"
						className="fixora-hero__cta"
						disabled={loading}
						onClick={handleFindTechnician}
					>
						<AutoAwesomeIcon fontSize="small" />
						{t('hero.findTechnician')}
					</FixoraButton>
				</div>

				<div className="fixora-hero__trust">
					<div className="fixora-hero__trust-viewport">
						<div className="fixora-hero__trust-track">
							{[...TRUST_KEYS, ...TRUST_KEYS].map((key, index) => (
								<span
									className="fixora-hero__trust-item"
									key={`${key}-${index}`}
									aria-hidden={index >= TRUST_KEYS.length}
								>
									<VerifiedOutlinedIcon fontSize="inherit" />
									{t(`hero.trust.${key}`)}
								</span>
							))}
						</div>
					</div>
				</div>

				{classification && (
					<div className="fixora-hero__classification">
						<span className="fixora-hero__chip">{classification.deviceType}</span>
						<span className="fixora-hero__chip">{classification.issueCategory}</span>
						<span className="fixora-hero__chip">{classification.repairComplexity}</span>
						{classification.keywords?.slice(0, 4).map((kw: string) => (
							<span key={kw} className="fixora-hero__chip fixora-hero__chip--muted">
								{kw}
							</span>
						))}
					</div>
				)}
			</div>

			{recommendations.length > 0 && (
				<div className="fixora-hero__results">
					<h2>{t('hero.recommendedTechnicians')}</h2>
					<p className="fixora-hero__hint">{t('hero.selectTechnicianHint')}</p>
					<HeroRecommendedCarousel recommendations={recommendations} />
				</div>
			)}
		</Stack>
	);
};

export default HeroRepairSearch;
