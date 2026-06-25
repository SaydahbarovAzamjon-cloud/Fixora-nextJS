/** Supported next-i18next locales (`kr` = Korean UI, not BCP-47 `ko`). */
export const APP_LOCALES = ['en', 'kr'] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

export function normalizeAppLocale(locale?: string | null): AppLocale {
	if (locale === 'kr') return 'kr';
	return 'en';
}

/** BCP-47 tag for date/time formatting from next-i18next locale (`en` | `kr`). */
export function dateLocale(locale?: string): string {
	switch (normalizeAppLocale(locale)) {
		case 'kr':
			return 'ko-KR';
		default:
			return 'en-US';
	}
}
