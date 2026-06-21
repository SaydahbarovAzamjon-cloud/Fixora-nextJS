import React, { useMemo } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useReactiveVar } from '@apollo/client';
import { Stack } from '@mui/material';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import TechniciansDiscoveryCarousel from '../../libs/components/technicians/TechniciansDiscoveryCarousel';
import TechniciansPageStats from '../../libs/components/technicians/TechniciansPageStats';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { useTechniciansDiscovery } from '../../libs/hooks/useTechniciansDiscovery';
import {
	DISCOVERY_SECTION_IDS,
	DiscoverySectionId,
} from '../../libs/utils/technicianDiscoverySections';

const SECTION_TITLE_KEYS: Record<DiscoverySectionId, string> = {
	trending: 'technicians.sections.trending',
	topRated: 'technicians.sections.topRated',
	mostReviewed: 'technicians.sections.mostReviewed',
	fastResponders: 'technicians.sections.fastResponders',
	newTechnicians: 'technicians.sections.newTechnicians',
	verified: 'technicians.sections.verified',
};

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const TechniciansListPage: NextPage = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const { sections, loading, error, refetch } = useTechniciansDiscovery();

	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const toggleFollowHandler = async (id: string, isFollowing: boolean) => {
		try {
			if (!id) return;
			if (!user?._id) throw new Error(Messages.error2);
			if (isFollowing) {
				await unsubscribe({ variables: { input: id } });
			} else {
				await subscribe({ variables: { input: id } });
				await sweetTopSmallSuccessAlert('Followed!', 800);
			}
			await refetch();
		} catch (err: unknown) {
			await sweetErrorHandling(err);
		}
	};

	const carouselSections = useMemo(() => {
		if (loading && sections.length === 0) {
			return DISCOVERY_SECTION_IDS.map((id) => ({
				id,
				titleKey: SECTION_TITLE_KEYS[id],
				technicians: [],
			}));
		}
		return sections;
	}, [loading, sections]);

	return (
		<Stack className="fixora-tech-list-page">
			<Stack className="container">
				<header className="fixora-tech-list-page__intro">
					<h1>{t('technicians.page.title')}</h1>
					<p>{t('technicians.page.subtitle')}</p>
				</header>

				{error && (
					<div className="fixora-tech-list-page__error" role="alert">
						{t('technicians.page.loadError')}
					</div>
				)}

				<div className="fixora-tech-list-page__sections">
					{carouselSections.map((section) => (
						<TechniciansDiscoveryCarousel
							key={section.id}
							titleKey={section.titleKey}
							technicians={section.technicians}
							loading={loading}
							currentUserId={user?._id}
							onToggleFollow={toggleFollowHandler}
						/>
					))}
				</div>

				{!loading && sections.length === 0 && !error && (
					<div className="fixora-tech-list-page__empty">{t('technicians.page.empty')}</div>
				)}

				<div className="fixora-tech-list-page__stats-bottom">
					<TechniciansPageStats />
				</div>
			</Stack>
		</Stack>
	);
};

export default withLayoutFull(TechniciansListPage);
