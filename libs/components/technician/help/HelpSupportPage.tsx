import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';

const FAQ_KEYS = ['0', '1', '2', '3', '4'] as const;
const ISSUE_KEYS = ['0', '1', '2', '3'] as const;

const HelpSupportPage: React.FC = () => {
	const { t } = useTranslation('technician');
	const router = useRouter();
	const [openFaq, setOpenFaq] = useState<string | null>(FAQ_KEYS[0]);

	const toggleFaq = (key: string) => {
		setOpenFaq((prev) => (prev === key ? null : key));
	};

	return (
		<div className="fth-page">
			<p className="fth-page__subtitle">{t('help.subtitle')}</p>

			<div className="fth-grid">
				<section className="fth-card fth-card--faq">
					<h2 className="fth-card__title">{t('help.faqTitle')}</h2>
					<div className="fth-faq">
						{FAQ_KEYS.map((key) => {
							const open = openFaq === key;
							return (
								<div key={key} className={`fth-faq__item${open ? ' fth-faq__item--open' : ''}`}>
									<button type="button" className="fth-faq__q" onClick={() => toggleFaq(key)}>
										<span>{t(`help.faq.${key}.q`)}</span>
										<ExpandMoreRounded className="fth-faq__chevron" />
									</button>
									{open && <p className="fth-faq__a">{t(`help.faq.${key}.a`)}</p>}
								</div>
							);
						})}
					</div>
				</section>

				<div className="fth-stack">
					<section className="fth-card">
						<h2 className="fth-card__title">{t('help.contactTitle')}</h2>
						<a className="fth-contact-row" href={`mailto:${t('help.contactEmail')}`}>
							<EmailOutlined fontSize="small" />
							<span>{t('help.contactEmail')}</span>
						</a>
						<div className="fth-contact-row fth-contact-row--muted">
							<AccessTimeOutlined fontSize="small" />
							<span>{t('help.contactHours')}</span>
						</div>
						<p className="fth-card__hint">{t('help.contactHint')}</p>
					</section>

					<section className="fth-card">
						<h2 className="fth-card__title">{t('help.quickLinksTitle')}</h2>
						<div className="fth-links">
							<button type="button" className="fth-link" onClick={() => router.push('/technician/settings')}>
								{t('help.linkSettings')}
							</button>
							<button type="button" className="fth-link" onClick={() => router.push('/technician/messages')}>
								{t('help.linkMessages')}
							</button>
							<button type="button" className="fth-link" onClick={() => router.push('/technician/profile')}>
								{t('help.linkProfile')}
							</button>
						</div>
					</section>

					<section className="fth-card">
						<h2 className="fth-card__title">{t('help.issuesTitle')}</h2>
						<ul className="fth-issues">
							{ISSUE_KEYS.map((key) => (
								<li key={key}>{t(`help.issues.${key}`)}</li>
							))}
						</ul>
					</section>
				</div>
			</div>
		</div>
	);
};

export default HelpSupportPage;
