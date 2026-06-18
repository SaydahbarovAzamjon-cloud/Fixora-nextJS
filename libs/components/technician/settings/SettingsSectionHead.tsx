import React from 'react';

interface SettingsSectionHeadProps {
	title: string;
	desc?: string;
}

const SettingsSectionHead: React.FC<SettingsSectionHeadProps> = ({ title, desc }) => (
	<div className="fts-section-head">
		<h2 className="fts-section-head__title">{title}</h2>
		{desc && <p className="fts-section-head__desc">{desc}</p>}
	</div>
);

export default SettingsSectionHead;
