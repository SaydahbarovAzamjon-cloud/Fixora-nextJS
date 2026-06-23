import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

/** Shared `getServerSideProps` for all `/_admin/*` pages. */
export async function adminPageProps({ locale }: GetServerSidePropsContext) {
	return {
		props: {
			...(await serverSideTranslations(locale ?? 'en', ['common', 'admin'])),
		},
	};
}
