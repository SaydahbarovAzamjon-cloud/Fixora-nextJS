import React, { useState } from 'react';
import { Stack } from '@mui/material';
import { useLazyQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForward from '@mui/icons-material/ArrowForward';
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

	const handleSearch = () => {
		const text = problemText.trim();
		if (text.length < 3) return;
		searchHero({ variables: { input: { problemText: text, limit: 5 } } });
	};

	return (
		<Stack className="fixora-hero">
			<div className="fixora-hero__content">
				<h1 className="fixora-hero__title">{t('hero.title')}</h1>
				<p className="fixora-hero__subtitle">{t('hero.subtitle')}</p>
				<div className="fixora-hero__search">
					<textarea
						className="fixora-hero__input"
						placeholder={t('hero.placeholder')}
						value={problemText}
						onChange={(e) => setProblemText(e.target.value)}
						rows={3}
					/>
					<FixoraButton variant="primary" className="fixora-hero__btn" disabled={loading} onClick={handleSearch}>
						<SearchIcon fontSize="small" />
						{t('hero.search')}
						<ArrowForward fontSize="small" />
					</FixoraButton>
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
