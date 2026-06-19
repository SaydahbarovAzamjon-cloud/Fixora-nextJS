import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const LANGS = ['en', 'kr'] as const;

interface LanguageToggleProps {
	className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = 'fixora-nav__lang' }) => {
	const router = useRouter();
	const [lang, setLang] = useState('en');

	useEffect(() => {
		setLang(localStorage.getItem('locale') ?? router.locale ?? 'en');
	}, [router.locale]);

	const langChoice = useCallback(
		async (locale: string) => {
			setLang(locale);
			localStorage.setItem('locale', locale);
			await router.push(router.asPath, router.asPath, { locale });
		},
		[router],
	);

	return (
		<div className={className}>
			{LANGS.map((code, idx) => (
				<React.Fragment key={code}>
					{idx > 0 && <span className="fixora-nav__lang-divider">|</span>}
					<button
						type="button"
						className={`fixora-nav__lang-btn ${lang === code ? 'fixora-nav__lang-btn--active' : ''}`}
						onClick={() => langChoice(code)}
					>
						{code.toUpperCase()}
					</button>
				</React.Fragment>
			))}
		</div>
	);
};

export default LanguageToggle;
