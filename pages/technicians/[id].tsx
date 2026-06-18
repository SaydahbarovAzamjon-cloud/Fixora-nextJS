import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Stack, Tab, Tabs } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import TechnicianProfileHero from '../../libs/components/technician-profile/TechnicianProfileHero';
import TechnicianProfileServices from '../../libs/components/technician-profile/TechnicianProfileServices';
import TechnicianProfilePortfolio from '../../libs/components/technician-profile/TechnicianProfilePortfolio';
import TechnicianProfileReviews from '../../libs/components/technician-profile/TechnicianProfileReviews';
import TechnicianProfileSidebar from '../../libs/components/technician-profile/TechnicianProfileSidebar';
import RepairStoriesRow from '../../libs/components/story/RepairStoriesRow';
import TechnicianProfileArticles from '../../libs/components/technician-profile/TechnicianProfileArticles';
import { GET_ARTICLES, GET_TECHNICIAN_REVIEWS, GET_USER } from '../../apollo/user/query';
import { GET_TECHNICIAN_STORIES } from '../../apollo/user/story';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { ArticleSummary, Story, TechnicianProfile, TechnicianReview } from '../../libs/types/fixora/fixora';
import { userVar } from '../../apollo/store';
import { Messages } from '../../libs/config';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { T } from '../../libs/types/common';

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
	const user = useReactiveVar(userVar);

	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const { data: userData, loading: userLoading, refetch: refetchTechnician } = useQuery(GET_USER, {
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

	const { data: storiesData } = useQuery(GET_TECHNICIAN_STORIES, {
		skip: !technicianId,
		variables: { input: { technicianId: technicianId ?? '', limit: 20 } },
		fetchPolicy: 'cache-and-network',
	});
	const stories: Story[] = (storiesData as T)?.getTechnicianStories?.list ?? [];

	const { data: articlesData } = useQuery(GET_ARTICLES, {
		skip: !technicianId,
		variables: {
			input: {
				page: 1,
				limit: 6,
				sort: 'createdAt',
				direction: 'DESC',
				search: { userId: technicianId ?? '' },
			},
		},
		fetchPolicy: 'cache-and-network',
	});
	const articles: ArticleSummary[] = (articlesData as T)?.getArticles?.list ?? [];

	const storyOwnerName =
		technician?.userNickname || technician?.userFullName || technician?.shopName || t('technicianProfile.loading');

	const toggleFollowHandler = async () => {
		try {
			if (!technicianId) return;
			if (!user?._id) throw new Error(Messages.error2);

			if (technician?.meFollowed?.[0]?.myFollowing) {
				await unsubscribe({ variables: { input: technicianId } });
			} else {
				await subscribe({ variables: { input: technicianId } });
				await sweetTopSmallSuccessAlert(t('technicianProfile.followed'), 800);
			}
			await refetchTechnician();
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const chatHandler = async () => {
		try {
			if (!technicianId) return;
			if (!user?._id) throw new Error(Messages.error2);
			await router.push(`/messages?peerId=${technicianId}`);
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

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
						<TechnicianProfileHero
							technician={technician}
							isOwnProfile={!!user?._id && user._id === technician._id}
							onToggleFollow={toggleFollowHandler}
							onChat={chatHandler}
						/>

						{stories.length > 0 && (
							<div className="fixora-tech-profile__stories">
								<RepairStoriesRow
									stories={stories}
									owner={{
										id: technician._id,
										name: storyOwnerName,
										avatar: technician.userProfileImage || undefined,
									}}
									mode="interactive"
									wrapped
								/>
							</div>
						)}

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
											{articles.length > 0 && (
												<div className="fixora-tech-profile__articles-section">
													<h3>{t('technicianProfile.articles.title')}</h3>
													<TechnicianProfileArticles articles={articles} />
												</div>
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
