import React, { useState } from 'react';
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
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { HERO_REPAIR_SEARCH } from '../../../apollo/user/hero';
import { FixoraButton } from '../ui';
import { sweetMixinErrorAlert } from '../../sweetAlert';

interface HeroRecommendation {
	technicianId: string;
	score: number;
	matchReason: string;
	technician: {
		_id: string;
		userNickname?: string;
		userFullName?: string;
		shopName?: string;
		averageRating?: number;
		userProfileImage?: string;
		specialty?: string;
	};
}

const CATEGORY_CHIPS = [
	{ key: 'iphone', Icon: PhoneIphoneIcon },
	{ key: 'macbook', Icon: LaptopMacIcon },
	{ key: 'ipad', Icon: TabletMacIcon },
	{ key: 'battery', Icon: BatteryAlertIcon },
	{ key: 'screen', Icon: SmartphoneIcon },
	{ key: 'water', Icon: WaterDropIcon },
] as const;

const TRUST_KEYS = ['experts', 'reviews', 'service', 'payments'] as const;

const HeroRepairSearch = () => {
	const { t } = useTranslation('common');
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
			router.push('/agent');
		}
	};

	return (
		<Stack className="fixora-hero">
			<div className="fixora-hero__scene" aria-hidden="true">
				<div className="fixora-hero__device fixora-hero__device--phone">
					<span className="fixora-hero__device-body" />
					<span className="fixora-hero__pedestal" />
				</div>
				<div className="fixora-hero__device fixora-hero__device--laptop">
					<span className="fixora-hero__laptop-screen" />
					<span className="fixora-hero__laptop-base" />
					<span className="fixora-hero__pedestal" />
				</div>
				<span className="fixora-hero__particle fixora-hero__particle--1" />
				<span className="fixora-hero__particle fixora-hero__particle--2" />
				<span className="fixora-hero__particle fixora-hero__particle--3" />
				<span className="fixora-hero__particle fixora-hero__particle--4" />
				<span className="fixora-hero__particle fixora-hero__particle--5" />
				<span className="fixora-hero__particle fixora-hero__particle--6" />
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

				{recommendations.length > 0 && (
					<div className="fixora-hero__results">
						<h2>{t('hero.recommendedTechnicians')}</h2>
						<p className="fixora-hero__hint">{t('hero.selectTechnicianHint')}</p>
						<div className="fixora-hero__cards">
							{recommendations.map((rec) => (
								<button
									key={rec.technicianId}
									type="button"
									className="fixora-hero__card"
									onClick={() => router.push(`/agent/detail?id=${rec.technicianId}`)}
								>
									<img
										src={rec.technician.userProfileImage || '/img/profile/defaultUser.svg'}
										alt=""
									/>
									<div>
										<strong>{rec.technician.shopName || rec.technician.userNickname}</strong>
										<span>
											{rec.technician.specialty} · ★ {rec.technician.averageRating?.toFixed(1) ?? '—'}
										</span>
										<small>{rec.matchReason}</small>
									</div>
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		</Stack>
	);
};

export default HeroRepairSearch;
