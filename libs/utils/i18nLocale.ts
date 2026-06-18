/** BCP-47 tag for date/time formatting from next-i18next locale (`en` | `kr` | `ru`). */
export function dateLocale(locale?: string): string {
	switch (locale) {
		case 'kr':
			return 'ko-KR';
		case 'ru':
			return 'ru-RU';
		default:
			return 'en-US';
	}
}
