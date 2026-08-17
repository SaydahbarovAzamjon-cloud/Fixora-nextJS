import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { APP_LOCALES, normalizeAppLocale, type AppLocale } from '../../utils/i18nLocale';

interface LanguageToggleProps {
	className?: string;
	compact?: boolean;
}

const LANGUAGE_LABEL: Record<AppLocale, string> = {
	en: 'EN',
	kr: 'KR',
};

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '', compact = false }) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const rootRef = useRef<HTMLDivElement>(null);
	const [lang, setLang] = useState<AppLocale>('en');
	const [open, setOpen] = useState(false);

	useEffect(() => {
		setLang(normalizeAppLocale(localStorage.getItem('locale') ?? router.locale));
	}, [router.locale]);

	useEffect(() => {
		if (!open) return;
		const onDoc = (event: MouseEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false);
		};
		document.addEventListener('mousedown', onDoc);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDoc);
			document.removeEventListener('keydown', onKey);
		};
	}, [open]);

	const langChoice = useCallback(
		async (locale: AppLocale) => {
			const next = normalizeAppLocale(locale);
			setOpen(false);
			if (next === lang) return;
			setLang(next);
			localStorage.setItem('locale', next);
			await router.push(router.asPath, router.asPath, { locale: next });
		},
		[lang, router],
	);

	const rootClass = [
		'fixora-nav__lang',
		'fixora-nav__lang--dropdown',
		compact ? 'fixora-nav__lang--compact' : '',
		open ? 'fixora-nav__lang--open' : '',
		className,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={rootClass} ref={rootRef}>
			<button
				type="button"
				className="fixora-nav__lang-trigger"
				aria-label={t('nav.language')}
				aria-haspopup="listbox"
				aria-expanded={open}
				onClick={() => setOpen((prev) => !prev)}
			>
				<span>{LANGUAGE_LABEL[lang]}</span>
				<ExpandMoreIcon className="fixora-nav__lang-chevron" fontSize="inherit" />
			</button>
			{open && (
				<div className="fixora-nav__lang-menu" role="listbox" aria-label={t('nav.language')}>
					{APP_LOCALES.map((code) => (
						<button
							key={code}
							type="button"
							role="option"
							aria-selected={lang === code}
							className={`fixora-nav__lang-option${lang === code ? ' fixora-nav__lang-option--active' : ''}`}
							onClick={() => void langChoice(code)}
						>
							{LANGUAGE_LABEL[code]}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default LanguageToggle;
