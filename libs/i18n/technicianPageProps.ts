import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

/** Shared SSR props for all `/technician/*` pages — loads common + technician namespaces. */
export async function technicianPageProps(locale?: string) {
	return {
		...(await serverSideTranslations(locale ?? 'en', ['common', 'technician', 'auth'])),
	};
}
