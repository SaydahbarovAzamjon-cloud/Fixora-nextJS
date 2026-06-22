import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

/** Shared SSR props for all `/_admin/*` pages. */
export async function adminPageProps(locale?: string) {
	return {
		...(await serverSideTranslations(locale ?? 'en', ['common', 'admin'])),
	};
}
