import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { FileQuestion } from 'lucide-react';
import { FixoraButton } from '../libs/components/ui';
import { FixoraLogo } from '../libs/components/brand';

const NotFoundPage: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();

	return (
		<div className="fixora-not-found-page">
			<div className="fixora-not-found-page__card">
				<FixoraLogo size="md" />
				<FileQuestion size={48} className="fixora-not-found-page__icon" />
				<h1 className="fixora-not-found-page__code">404</h1>
				<h2 className="fixora-not-found-page__title">{t('errors.pageNotFoundTitle', { defaultValue: 'Page Not Found' })}</h2>
				<p className="fixora-not-found-page__text">
					{t('errors.pageNotFoundText', { defaultValue: 'The page you are looking for does not exist.' })}
				</p>
				<FixoraButton variant="primary" onClick={() => router.push('/')}>
					{t('errors.backToHome', { defaultValue: 'Back to Home' })}
				</FixoraButton>
			</div>
		</div>
	);
};

export async function getStaticProps({ locale }: { locale?: string }) {
	return {
		props: {
			...(await serverSideTranslations(locale ?? 'en', ['common'])),
		},
	};
}

export default NotFoundPage;
