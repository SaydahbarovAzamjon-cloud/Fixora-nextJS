import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery } from '@apollo/client';
import { Stack, Tab, Tabs } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import TechnicianProfileHero from '../../libs/components/technician-profile/TechnicianProfileHero';
import TechnicianProfileServices from '../../libs/components/technician-profile/TechnicianProfileServices';
import TechnicianProfilePortfolio from '../../libs/components/technician-profile/TechnicianProfilePortfolio';
import TechnicianProfileReviews from '../../libs/components/technician-profile/TechnicianProfileReviews';
import TechnicianProfileSidebar from '../../libs/components/technician-profile/TechnicianProfileSidebar';
import { GET_TECHNICIAN_REVIEWS, GET_USER } from '../../apollo/user/query';
import { TechnicianProfile, TechnicianReview } from '../../libs/types/fixora/fixora';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

type ProfileTab = 'about' | 'services' | 'portfolio' | 'reviews';

const TechnicianProfilePage: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const technicianId = router.query.id as string | undefined;
	const [activeTab, setActiveTab] = useState<ProfileTab>('about');

	const { data: userData, loading: userLoading } = useQuery(GET_USER, {
		skip: !technicianId,
		variables: { userId: technicianId },
		fetchPolicy: 'network-only',
	});

	const { data: reviewsData, loading: reviewsLoading } = useQuery(GET_TECHNICIAN_REVIEWS, {
		skip: !technicianId,
		variables: {
			input: {
				page: 1,
				limit: 10,
				sort: 'createdAt',
				direction: 'DESC',
				search: { technicianId: technicianId ?? '' },
			},
		},
		fetchPolicy: 'network-only',
	});

	const technician: TechnicianProfile | null = userData?.getUser ?? null;
	const reviews: TechnicianReview[] = reviewsData?.getTechnicianReviews?.list ?? [];

	if (!technicianId) return null;

	return (
		<Stack className="fixora-tech-profile-page">
			<Stack className="container">
				<Link href="/search" className="fixora-tech-profile__back">
					<ArrowBackIcon fontSize="small" />
					{t('technicianProfile.backToSearch')}
				</Link>

				{userLoading && !technician ? (
					<div className="fixora-tech-profile__loading">{t('technicianProfile.loading')}</div>
				) : !technician ? (
					<div className="fixora-tech-profile__empty">{t('technicianProfile.notFound')}</div>
				) : (
					<>
						<TechnicianProfileHero technician={technician} />

						<div className="fixora-tech-profile__layout">
							<div className="fixora-tech-profile__main">
								<Tabs
									value={activeTab}
									onChange={(_, value: ProfileTab) => setActiveTab(value)}
									className="fixora-tech-profile__tabs"
								>
									<Tab value="about" label={t('technicianProfile.tabs.about')} />
									<Tab value="services" label={t('technicianProfile.tabs.services')} />
									<Tab value="portfolio" label={t('technicianProfile.tabs.portfolio')} />
									<Tab value="reviews" label={t('technicianProfile.tabs.reviews')} />
								</Tabs>

								<div className="fixora-tech-profile__panel">
									{activeTab === 'about' && (
										<div className="fixora-tech-profile__about">
											{technician.userBio ? (
												<p>{technician.userBio}</p>
											) : (
												<p className="fixora-tech-profile__empty">{t('technicianProfile.about.empty')}</p>
											)}
										</div>
									)}
									{activeTab === 'services' && <TechnicianProfileServices services={technician.services} />}
									{activeTab === 'portfolio' && <TechnicianProfilePortfolio images={technician.portfolioImages} />}
									{activeTab === 'reviews' &&
										(reviewsLoading ? (
											<p className="fixora-tech-profile__empty">{t('technicianProfile.loading')}</p>
										) : (
											<TechnicianProfileReviews reviews={reviews} />
										))}
								</div>
							</div>

							<TechnicianProfileSidebar technician={technician} />
						</div>
					</>
				)}
			</Stack>
		</Stack>
	);
};

export default withLayoutFull(TechnicianProfilePage);
