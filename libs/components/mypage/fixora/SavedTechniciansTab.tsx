import React from 'react';
import { useTranslation } from 'next-i18next';

/** BACKEND_GAPS: GAP-098 — getUserLikedTechnicians not in schema yet */
const SavedTechniciansTab = () => {
	const { t } = useTranslation('common');

	return (
		<div className="fixora-mypage__panel">
			<h2 className="fixora-mypage__panel-title">{t('mypage.tabs.savedTechnicians')}</h2>
			<p className="fixora-mypage__empty">{t('mypage.saved.empty')}</p>
		</div>
	);
};

export default SavedTechniciansTab;
