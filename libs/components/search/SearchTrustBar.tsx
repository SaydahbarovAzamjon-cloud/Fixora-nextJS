import React from 'react';
import { useTranslation } from 'next-i18next';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const TRUST_ITEMS = [
	{ key: 'verified', Icon: VerifiedOutlinedIcon, tone: 'blue' },
	{ key: 'quality', Icon: WorkspacePremiumOutlinedIcon, tone: 'orange' },
	{ key: 'quick', Icon: BoltOutlinedIcon, tone: 'purple' },
	{ key: 'secure', Icon: LockOutlinedIcon, tone: 'green' },
] as const;

const SearchTrustBar = () => {
	const { t } = useTranslation('common');

	return (
		<section className="fixora-search-trust">
			{TRUST_ITEMS.map(({ key, Icon, tone }) => (
				<div key={key} className="fixora-search-trust__item">
					<div className={`fixora-search-trust__icon fixora-search-trust__icon--${tone}`}>
						<Icon />
					</div>
					<strong className="fixora-search-trust__title">{t(`search.trust.${key}.title`)}</strong>
					<p className="fixora-search-trust__desc">{t(`search.trust.${key}.description`)}</p>
				</div>
			))}
		</section>
	);
};

export default SearchTrustBar;
