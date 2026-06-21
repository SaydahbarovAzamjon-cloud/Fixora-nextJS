import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedRounded from '@mui/icons-material/VerifiedRounded';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import StarRounded from '@mui/icons-material/StarRounded';
import ThumbUpAltOutlined from '@mui/icons-material/ThumbUpAltOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import SmartphoneOutlined from '@mui/icons-material/SmartphoneOutlined';
import LaptopMacOutlined from '@mui/icons-material/LaptopMacOutlined';
import TabletMacOutlined from '@mui/icons-material/TabletMacOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import GppGoodOutlined from '@mui/icons-material/GppGoodOutlined';
import CheckRounded from '@mui/icons-material/CheckRounded';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import PersonAddAlt1Outlined from '@mui/icons-material/PersonAddAlt1Outlined';
import HowToRegOutlined from '@mui/icons-material/HowToRegOutlined';
import PhotoLibraryOutlined from '@mui/icons-material/PhotoLibraryOutlined';
import RateReviewOutlined from '@mui/icons-material/RateReviewOutlined';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import { profileImageDraftVar, userVar } from '../../../apollo/store';
import { GET_ARTICLES, GET_TECHNICIAN_REVIEWS, GET_USER } from '../../../apollo/user/query';
import { GET_MY_ARTICLES, GET_USER_FOLLOWERS } from '../../../apollo/user/profile';
import { GET_TECHNICIAN_STORIES } from '../../../apollo/user/story';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { LIKE_TARGET_ARTICLE } from '../../../apollo/user/article';
import ProfileArticleCard from './ProfileArticleCard';
import RepairStoriesRow from '../story/RepairStoriesRow';
import BookingServiceTypeOptions from '../booking/BookingServiceTypeOptions';
import { Article, Story, TechnicianProfile, TechnicianReview } from '../../types/fixora/fixora';
import { T } from '../../types/common';
import { Messages } from '../../config';
import { formatKrwNumber } from '../../utils/formatCurrency';
import { dateLocale } from '../../utils/i18nLocale';
import {
	getTechnicianAvatarUrl,
	getTechnicianDisplayName,
	getTechnicianOwnerSubtitle,
	initialsOf,
} from '../../utils/technicianProfileDisplay';
import { resolveProfileImageUrl } from '../../utils/profileImage';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';

export type TechnicianPublicProfileVariant = 'owner' | 'visitor';

export interface TechnicianPublicProfileViewProps {
	technicianId?: string;
	variant: TechnicianPublicProfileVariant;
}

const TAB_IDS = ['overview', 'services', 'portfolio', 'reviews'] as const;
type TabId = (typeof TAB_IDS)[number];

const RATING_STARS = [5, 4, 3, 2, 1] as const;

const ACCENT_PRIMARY = 'var(--fixora-primary)';
const ACCENT_STAR = 'var(--fixora-primary-hover)';

const CREDENTIALS = [
	{ color: ACCENT_PRIMARY, verified: false, titleKey: 'technicianProfile.pp.cred.topTech', subKey: 'technicianProfile.pp.cred.topTechSub', icon: <EmojiEventsOutlined style={{ fontSize: 20 }} /> },
	{ color: '#3B82F6', verified: true, titleKey: 'technicianProfile.pp.cred.verifiedPro', subKey: 'technicianProfile.pp.cred.verifiedProSub', icon: <VerifiedRounded style={{ fontSize: 20 }} /> },
	{ color: ACCENT_PRIMARY, verified: false, titleKey: 'technicianProfile.pp.cred.repairs', subKey: 'technicianProfile.pp.cred.repairsSub', icon: <BoltOutlined style={{ fontSize: 20 }} /> },
	{ color: '#22C55E', verified: false, titleKey: 'technicianProfile.pp.cred.fiveStar', subKey: 'technicianProfile.pp.cred.fiveStarSub', icon: <StarRounded style={{ fontSize: 20 }} /> },
	{ color: '#A855F7', verified: false, titleKey: 'technicianProfile.pp.cred.fastResponse', subKey: 'technicianProfile.pp.cred.fastResponseSub', icon: <AccessTimeOutlined style={{ fontSize: 19 }} /> },
	{ color: '#3B82F6', verified: true, titleKey: 'technicianProfile.pp.cred.certified', subKey: 'technicianProfile.pp.cred.certifiedSub', icon: <GppGoodOutlined style={{ fontSize: 20 }} /> },
];

const SPECIALIZATIONS = [
	{ color: ACCENT_PRIMARY, titleKey: 'technicianProfile.pp.spec.iphone', subKey: 'technicianProfile.pp.spec.iphoneSub', jobsKey: 'technicianProfile.pp.spec.iphoneJobs', icon: <SmartphoneOutlined style={{ fontSize: 20 }} /> },
	{ color: '#C8C8C8', titleKey: 'technicianProfile.pp.spec.macbook', subKey: 'technicianProfile.pp.spec.macbookSub', jobsKey: 'technicianProfile.pp.spec.macbookJobs', icon: <LaptopMacOutlined style={{ fontSize: 20 }} /> },
	{ color: ACCENT_PRIMARY, titleKey: 'technicianProfile.pp.spec.ipad', subKey: 'technicianProfile.pp.spec.ipadSub', jobsKey: 'technicianProfile.pp.spec.ipadJobs', icon: <TabletMacOutlined style={{ fontSize: 20 }} /> },
];

const iconSoftBg = (color: string) => (color === ACCENT_PRIMARY ? 'var(--fixora-primary-soft)' : `${color}1f`);

const Stars = ({ count }: { count: number }) => (
	<>
		{Array.from({ length: 5 }).map((_, i) => (
			<StarRounded key={i} style={{ fontSize: 14, color: i < count ? ACCENT_STAR : '#3A3A3A' }} />
		))}
	</>
);

const reviewStars = (r: TechnicianReview): number =>
	Math.round(((r.repairQuality ?? 0) + (r.repairSpeed ?? 0) + (r.communication ?? 0)) / 3);

const reviewDeviceLabel = (r: TechnicianReview): string | undefined => {
	const device = r.deviceData;
	if (!device?.deviceModel && !device?.deviceBrand) return undefined;
	return [device.deviceBrand, device.deviceModel].filter(Boolean).join(' ');
};

const TechnicianPublicProfileView: React.FC<TechnicianPublicProfileViewProps> = ({ technicianId, variant }) => {
	const router = useRouter();
	const { t, i18n } = useTranslation('common');
	const authUser = useReactiveVar(userVar);
	const profileDraft = useReactiveVar(profileImageDraftVar);
	const [activeTab, setActiveTab] = useState<TabId>('overview');
	const [likePendingId, setLikePendingId] = useState<string | null>(null);
	const [articleOverrides, setArticleOverrides] = useState<Record<string, Partial<Article>>>({});
	const isOwner = variant === 'owner';

	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeArticle] = useMutation(LIKE_TARGET_ARTICLE);

	const { data: userData, loading: userLoading, refetch: refetchUser } = useQuery(GET_USER, {
		variables: { userId: technicianId },
		skip: !technicianId,
		fetchPolicy: 'network-only',
	});
	const profile = (userData as T)?.getUser as TechnicianProfile | undefined;

	const { data: ownerArticlesData } = useQuery(GET_MY_ARTICLES, {
		variables: { input: { page: 1, limit: 6, search: {} } },
		skip: !technicianId || !isOwner,
		fetchPolicy: 'cache-and-network',
	});

	const { data: visitorArticlesData } = useQuery(GET_ARTICLES, {
		variables: {
			input: {
				page: 1,
				limit: 6,
				sort: 'createdAt',
				direction: 'DESC',
				search: { userId: technicianId ?? '' },
			},
		},
		skip: !technicianId || isOwner,
		fetchPolicy: 'cache-and-network',
	});

	const articles: Article[] = useMemo(() => {
		const list: Article[] = isOwner
			? ((ownerArticlesData as T)?.getMyArticles?.list ?? [])
			: ((visitorArticlesData as T)?.getArticles?.list ?? []);
		return list.map((article) => ({ ...article, ...articleOverrides[article._id] }));
	}, [articleOverrides, isOwner, ownerArticlesData, visitorArticlesData]);

	const { data: reviewsData, loading: reviewsLoading } = useQuery(GET_TECHNICIAN_REVIEWS, {
		variables: {
			input: { page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: { technicianId: technicianId ?? '' } },
		},
		skip: !technicianId,
		fetchPolicy: 'cache-and-network',
	});
	const reviews: TechnicianReview[] = (reviewsData as T)?.getTechnicianReviews?.list ?? [];
	const distribution: { star: number; count: number }[] = (reviewsData as T)?.getTechnicianReviews?.distribution ?? [];
	const reviewsTotal: number = (reviewsData as T)?.getTechnicianReviews?.metaCounter?.[0]?.total ?? reviews.length;

	const { data: followersData } = useQuery(GET_USER_FOLLOWERS, {
		variables: { input: { page: 1, limit: 24, search: { followingId: technicianId ?? '' } } },
		skip: !technicianId,
		fetchPolicy: 'cache-and-network',
	});
	const followerList: T[] = (followersData as T)?.getUserFollowers?.list ?? [];
	const followersFromList =
		(followersData as T)?.getUserFollowers?.metaCounter?.[0]?.total ?? followerList.length;
	const followersTotal = Math.max(followersFromList, profile?.followersCount ?? 0);

	const { data: storiesData, refetch: refetchStories } = useQuery(GET_TECHNICIAN_STORIES, {
		variables: { input: { technicianId: technicianId ?? '', limit: 20 } },
		skip: !technicianId,
		fetchPolicy: 'cache-and-network',
	});
	const stories: Story[] = (storiesData as T)?.getTechnicianStories?.list ?? [];

	const displayName = getTechnicianDisplayName(profile);
	const ownerSubtitle = getTechnicianOwnerSubtitle(profile);
	const profileImageSrc = isOwner
		? getTechnicianAvatarUrl(profile, profileDraft)
		: getTechnicianAvatarUrl(profile);
	const specialty = profile?.specialty || '';
	const location = profile?.userLocation || '';
	const rating = profile?.averageRating ?? 0;
	const completed = profile?.completedJobsCount ?? 0;
	const isOnline = profile?.isOnline === true;
	const isVerified = profile?.isVerified === true;
	const bio = profile?.userBio;
	const isFollowing = !!profile?.meFollowed?.[0]?.myFollowing;
	const services = profile?.services ?? [];
	const portfolioImages = profile?.portfolioImages ?? [];
	const canCreateStory =
		isOwner && profile?.userType === 'TECHNICIAN' && profile?.verificationStatus === 'APPROVED';

	const initials = useMemo(() => initialsOf(displayName), [displayName]);

	const formatDate = (value?: string): string => {
		if (!value) return '';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return '';
		return date.toLocaleDateString(dateLocale(i18n.language), { month: 'short', day: 'numeric', year: 'numeric' });
	};

	const messageHandler = () => {
		if (isOwner) {
			router.push('/technician/messages');
			return;
		}
		if (!technicianId) return;
		if (!authUser?._id) {
			sweetErrorHandling(new Error(Messages.error2));
			return;
		}
		router.push(`/messages?peerId=${technicianId}`);
	};

	const viewLiveProfileHandler = () => {
		if (isOwner) {
			router.push('/technician/profile');
			return;
		}
		if (technicianId) window.open(`/technicians/${technicianId}`, '_blank', 'noopener,noreferrer');
	};

	const toggleFollowHandler = async () => {
		try {
			if (!technicianId) return;
			if (!authUser?._id) throw new Error(Messages.error2);
			if (isFollowing) {
				await unsubscribe({ variables: { input: technicianId } });
			} else {
				await subscribe({ variables: { input: technicianId } });
				await sweetTopSmallSuccessAlert(t('technicianProfile.followed'), 800);
			}
			await refetchUser();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const bookServiceHandler = () => {
		if (technicianId) router.push(`/technicians/${technicianId}/book`);
	};

	const handleArticleLike = useCallback(
		async (articleId: string) => {
			if (!authUser?._id) {
				await sweetErrorHandling(new Error(Messages.error2));
				return;
			}
			setLikePendingId(articleId);
			try {
				const result = await likeArticle({ variables: { input: articleId } });
				const updated = result.data?.likeTargetArticle;
				if (updated) {
					setArticleOverrides((prev) => ({
						...prev,
						[articleId]: {
							articleLikes: updated.articleLikes,
							meLiked: updated.meLiked,
						},
					}));
				}
			} catch (err) {
				await sweetErrorHandling(err);
			} finally {
				setLikePendingId(null);
			}
		},
		[authUser?._id, likeArticle],
	);

	if (!technicianId) {
		return <div className="fixora-pp-empty"><div className="fixora-pp-empty__title">{t('technicianProfile.loading')}</div></div>;
	}

	if (userLoading && !profile) {
		return <div className="fixora-pp-empty"><div className="fixora-pp-empty__title">{t('technicianProfile.loading')}</div></div>;
	}

	if (!profile) {
		return <div className="fixora-pp-empty"><div className="fixora-pp-empty__title">{t('technicianProfile.notFound')}</div></div>;
	}

	const storyAvatar = resolveProfileImageUrl(profile.userProfileImage);

	return (
		<div className={variant === 'visitor' ? 'fixora-pp-visitor-wrap' : undefined}>
			{variant === 'visitor' && (
				<Link href="/search" className="fixora-tech-profile__back">
					<ArrowBackIcon fontSize="small" />
					{t('technicianProfile.backToSearch')}
				</Link>
			)}

			<div className="fixora-pp-page">
				<div className="fixora-pp-header">
					<div className="fixora-pp-header__avatar-wrap">
						<div className="fixora-pp-header__avatar">
							{profileImageSrc && profileImageSrc !== '/img/profile/defaultUser.svg' ? (
								<img src={profileImageSrc} alt={displayName} />
							) : (
								initials
							)}
						</div>
						{isOnline && <span className="fixora-pp-header__online" />}
					</div>

					<div className="fixora-pp-header__main">
						<div className="fixora-pp-header__name-row">
							<h1 className="fixora-pp-header__name">{displayName}</h1>
							{isVerified && <VerifiedRounded style={{ fontSize: 22, color: '#3B82F6' }} />}
						</div>
						{ownerSubtitle && <div className="fixora-pp-header__owner">{ownerSubtitle}</div>}
						<div className="fixora-pp-header__role">
							{t('technicianProfile.pp.proTechnician')}
							{specialty ? ` · ${specialty}` : ''}
						</div>
						{location && (
							<div className="fixora-pp-header__loc">
								<LocationOnOutlined style={{ fontSize: 16 }} />
								{location}
							</div>
						)}

						<div className="fixora-pp-stats">
							<div className="fixora-pp-stat">
								<div className="fixora-pp-stat__label">
									<StarRounded style={{ fontSize: 15, color: ACCENT_STAR }} /> {t('technicianProfile.pp.stat.rating')}
								</div>
								<div className="fixora-pp-stat__value">
									{rating}<span className="fixora-pp-stat__unit">/5.0</span>
								</div>
							</div>
							<div className="fixora-pp-stat">
								<div className="fixora-pp-stat__label">
									<ThumbUpAltOutlined style={{ fontSize: 14, color: '#3B82F6' }} /> {t('technicianProfile.pp.stat.reviews')}
								</div>
								<div className="fixora-pp-stat__value">{reviewsTotal}</div>
							</div>
							<div className="fixora-pp-stat">
								<div className="fixora-pp-stat__label">
									<CheckCircleOutline style={{ fontSize: 14, color: '#22C55E' }} /> {t('technicianProfile.pp.stat.completed')}
								</div>
								<div className="fixora-pp-stat__value">
									{completed}<span className="fixora-pp-stat__unit">{t('technicianProfile.pp.stat.jobsUnit')}</span>
								</div>
							</div>
							<div className="fixora-pp-stat">
								<div className="fixora-pp-stat__label">
									<GroupOutlined style={{ fontSize: 14, color: '#EC4899' }} /> {t('technicianProfile.pp.stat.followers')}
								</div>
								<div className="fixora-pp-stat__value">{followersTotal}</div>
							</div>
							<div className="fixora-pp-stat">
								<div className="fixora-pp-stat__label">
									<AccessTimeOutlined style={{ fontSize: 14, color: '#A855F7' }} /> {t('technicianProfile.pp.stat.response')}
								</div>
								<div className="fixora-pp-stat__value">{t('technicianProfile.pp.stat.responseValue')}</div>
							</div>
						</div>
					</div>

					<div className="fixora-pp-header__actions">
						<button className="fixora-pp-btn fixora-pp-btn--primary" type="button" onClick={messageHandler}>
							<ChatBubbleOutlineOutlined style={{ fontSize: 17 }} /> {t('technicianProfile.pp.messageMe')}
						</button>
						{!isOwner && (
							<button
								className={`fixora-pp-btn ${isFollowing ? 'fixora-pp-btn--secondary' : 'fixora-pp-btn--primary'}`}
								type="button"
								onClick={toggleFollowHandler}
							>
								{isFollowing ? (
									<>
										<HowToRegOutlined style={{ fontSize: 16 }} /> {t('technicianProfile.following')}
									</>
								) : (
									<>
										<PersonAddAlt1Outlined style={{ fontSize: 16 }} /> {t('technicianProfile.follow')}
									</>
								)}
							</button>
						)}
						{!isOwner && (
							<button className="fixora-pp-btn fixora-pp-btn--primary" type="button" onClick={bookServiceHandler}>
								<BuildOutlined style={{ fontSize: 16 }} /> {t('technicianProfile.sidebar.bookCta')}
							</button>
						)}
						{isOwner && (
							<button className="fixora-pp-btn fixora-pp-btn--ghost" type="button" onClick={viewLiveProfileHandler}>
								<OpenInNewOutlined style={{ fontSize: 16 }} /> {t('technicianProfile.pp.viewLive')}
							</button>
						)}
					</div>
				</div>

				{!isOwner && variant === 'visitor' && <BookingServiceTypeOptions variant="inline" />}

				<RepairStoriesRow
					stories={stories}
					owner={{ id: technicianId, name: displayName, avatar: storyAvatar !== '/img/profile/defaultUser.svg' ? storyAvatar : undefined }}
					mode={isOwner ? 'preview' : 'interactive'}
					canCreateStory={canCreateStory}
					onStoriesChange={() => refetchStories()}
				/>

				<div className="fixora-pp-tabs">
					{TAB_IDS.map((tab) => (
						<button
							key={tab}
							type="button"
							className={`fixora-pp-tab ${activeTab === tab ? 'fixora-pp-tab--active' : ''}`}
							onClick={() => setActiveTab(tab)}
						>
							{t(`technicianProfile.pp.tabs.${tab}`)}
						</button>
					))}
				</div>

				{activeTab === 'overview' && (
					<>
						<div className="fixora-pp-panel">
							<h3 className="fixora-pp-panel__title">{t('technicianProfile.tabs.about')}</h3>
							{bio ? (
								<p className="fixora-pp-panel__text">{bio}</p>
							) : (
								<p className="fixora-pp-panel__text">{t('technicianProfile.about.empty')}</p>
							)}
						</div>

						<div className="fixora-pp-panel">
							<h3 className="fixora-pp-panel__title">{t('technicianProfile.articles.title')}</h3>
							{articles.length > 0 ? (
								<div className="fixora-home-tips__grid">
									{articles.map((article) => (
										<ProfileArticleCard
											key={article._id}
											article={article}
											onLike={handleArticleLike}
											likePending={likePendingId === article._id}
										/>
									))}
								</div>
							) : (
								<div className="fixora-pp-empty">
									<div className="fixora-pp-empty__icon">
										<ArticleOutlined style={{ fontSize: 26 }} />
									</div>
									<div className="fixora-pp-empty__title">{t('technicianProfile.pp.articlesEmptyTitle')}</div>
									<div className="fixora-pp-empty__sub">{t('technicianProfile.pp.articlesEmptySub')}</div>
								</div>
							)}
						</div>

						<div className="fixora-pp-panel">
							<h3 className="fixora-pp-panel__title">{t('technicianProfile.pp.followersTitle', { count: followersTotal })}</h3>
							{followerList.length > 0 ? (
								<div className="fixora-pp-followers">
									{followerList.map((f) => {
										const fd = f.followerData || {};
										const fName = fd.userNickname || fd.userFullName || t('technicianProfile.pp.defaultUser');
										const fAvatar = resolveProfileImageUrl(fd.userProfileImage);
										return (
											<div key={f._id} className="fixora-pp-follower">
												<div className="fixora-pp-follower__avatar">
													{fAvatar !== '/img/profile/defaultUser.svg' ? (
														<img src={fAvatar} alt={fName} />
													) : (
														initialsOf(fName)
													)}
												</div>
												<span className="fixora-pp-follower__name">{fName}</span>
											</div>
										);
									})}
								</div>
							) : (
								<div className="fixora-pp-empty">
									<div className="fixora-pp-empty__icon">
										<GroupOutlined style={{ fontSize: 26 }} />
									</div>
									<div className="fixora-pp-empty__title">{t('technicianProfile.pp.followersEmptyTitle')}</div>
									<div className="fixora-pp-empty__sub">{t('technicianProfile.pp.followersEmptySub')}</div>
								</div>
							)}
						</div>

						<div className="fixora-pp-row">
							<div className="fixora-pp-panel">
								<h3 className="fixora-pp-panel__title">{t('technicianProfile.pp.credentialsTitle')}</h3>
								<div className="fixora-pp-creds">
									{CREDENTIALS.map((c) => (
										<div key={c.titleKey} className="fixora-pp-cred">
											<div className="fixora-pp-cred__icon" style={{ background: iconSoftBg(c.color), color: c.color }}>
												{c.icon}
											</div>
											<div className="fixora-pp-cred__body">
												<div className="fixora-pp-cred__title">{t(c.titleKey)}</div>
												<div className="fixora-pp-cred__sub">{t(c.subKey)}</div>
											</div>
											{c.verified ? (
												<VerifiedRounded style={{ fontSize: 19, color: c.color }} />
											) : (
												<CheckCircleOutline style={{ fontSize: 19, color: c.color }} />
											)}
										</div>
									))}
								</div>
							</div>

							<div className="fixora-pp-panel">
								<h3 className="fixora-pp-panel__title">{t('technicianProfile.pp.specializationsTitle')}</h3>
								<div className="fixora-pp-specs">
									{SPECIALIZATIONS.map((s) => (
										<div key={s.titleKey} className="fixora-pp-spec">
											<div className="fixora-pp-spec__icon" style={{ background: iconSoftBg(s.color), color: s.color }}>
												{s.icon}
											</div>
											<div className="fixora-pp-spec__body">
												<div className="fixora-pp-spec__title">{t(s.titleKey)}</div>
												<div className="fixora-pp-spec__sub">{t(s.subKey)}</div>
											</div>
											<div className="fixora-pp-spec__jobs">{t(s.jobsKey)}</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</>
				)}

				{activeTab === 'services' && (
					services.length > 0 ? (
						<div className="fixora-pp-services">
							{services.map((s, i) => (
								<div key={`${s.title}-${i}`} className="fixora-pp-service">
									<div className="fixora-pp-service__title">{s.title}</div>
									<div className="fixora-pp-service__foot">
										<div>
											<div className="fixora-pp-service__price">
												{t('technicianProfile.services.fromPrice', { price: formatKrwNumber(s.basePrice) })}
											</div>
										</div>
										<button className="fixora-pp-service__book" type="button" onClick={bookServiceHandler}>
											{t('technicianProfile.pp.bookNow')}
										</button>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="fixora-pp-empty">
							<div className="fixora-pp-empty__icon">
								<BuildOutlined style={{ fontSize: 26 }} />
							</div>
							<div className="fixora-pp-empty__title">{t('technicianProfile.pp.servicesEmptyTitle')}</div>
							<div className="fixora-pp-empty__sub">{t('technicianProfile.services.empty')}</div>
						</div>
					)
				)}

				{activeTab === 'portfolio' && (
					portfolioImages.length > 0 ? (
						<div className="fixora-pp-portfolio">
							{portfolioImages.map((img, i) => (
								<div key={`${img}-${i}`} className="fixora-pp-port">
									<div className="fixora-pp-port__media fixora-pp-port__media--image">
										<img src={resolveProfileImageUrl(img)} alt="" />
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="fixora-pp-empty">
							<div className="fixora-pp-empty__icon">
								<PhotoLibraryOutlined style={{ fontSize: 26 }} />
							</div>
							<div className="fixora-pp-empty__title">{t('technicianProfile.pp.portfolioEmptyTitle')}</div>
							<div className="fixora-pp-empty__sub">{t('technicianProfile.portfolio.empty')}</div>
						</div>
					)
				)}

				{activeTab === 'reviews' && (
					reviewsLoading && reviews.length === 0 ? (
						<div className="fixora-pp-empty">
							<div className="fixora-pp-empty__title">{t('technicianProfile.loading')}</div>
						</div>
					) : reviews.length > 0 ? (
						<div className="fixora-pp-reviews">
							<div className="fixora-pp-panel fixora-pp-rsummary">
								<div className="fixora-pp-rsummary__score">
									<div className="fixora-pp-rsummary__num">{rating}</div>
									<div className="fixora-pp-rsummary__stars"><Stars count={Math.round(rating)} /></div>
									<div className="fixora-pp-rsummary__count">{t('technicianProfile.pp.reviewsCount', { count: reviewsTotal })}</div>
								</div>
								<div className="fixora-pp-rsummary__bars">
									{RATING_STARS.map((star) => {
										const count = distribution.find((d) => d.star === star)?.count ?? 0;
										const pct = reviewsTotal > 0 ? Math.round((count / reviewsTotal) * 100) : 0;
										return (
											<div key={star} className="fixora-pp-rbar">
												<span className="fixora-pp-rbar__star">{star} <StarRounded style={{ fontSize: 12, color: ACCENT_STAR }} /></span>
												<span className="fixora-pp-rbar__track">
													<span className="fixora-pp-rbar__fill" style={{ width: `${pct}%` }} />
												</span>
												<span className="fixora-pp-rbar__pct">{pct}%</span>
											</div>
										);
									})}
								</div>
							</div>

							{reviews.map((r) => {
								const customer = (r as T).customerData || {};
								const cName = customer.userNickname || customer.userFullName || t('technicianProfile.pp.defaultCustomer');
								const cAvatar = resolveProfileImageUrl(customer.userProfileImage);
								const deviceLabel = reviewDeviceLabel(r);
								return (
									<div key={r._id} className="fixora-pp-panel fixora-pp-review">
										<div className="fixora-pp-review__head">
											<div className="fixora-pp-review__avatar">
												{cAvatar !== '/img/profile/defaultUser.svg' ? (
													<img src={cAvatar} alt={cName} />
												) : (
													initialsOf(cName)
												)}
											</div>
											<div className="fixora-pp-review__id">
												<div className="fixora-pp-review__name-row">
													<span className="fixora-pp-review__name">{cName}</span>
													<span className="fixora-pp-review__verified"><CheckRounded style={{ fontSize: 13 }} /> {t('technicianProfile.verified')}</span>
												</div>
												<div className="fixora-pp-review__stars"><Stars count={reviewStars(r)} /></div>
											</div>
											<div className="fixora-pp-review__meta">
												<div className="fixora-pp-review__date">{formatDate(r.createdAt)}</div>
												{deviceLabel && <div className="fixora-pp-review__device">{deviceLabel}</div>}
											</div>
										</div>
										{r.reviewContent && <p className="fixora-pp-review__text">{r.reviewContent}</p>}
									</div>
								);
							})}
						</div>
					) : (
						<div className="fixora-pp-empty">
							<div className="fixora-pp-empty__icon">
								<RateReviewOutlined style={{ fontSize: 26 }} />
							</div>
							<div className="fixora-pp-empty__title">{t('technicianProfile.pp.reviewsEmptyTitle')}</div>
							<div className="fixora-pp-empty__sub">{t('technicianProfile.reviews.empty')}</div>
						</div>
					)
				)}
			</div>
		</div>
	);
};

export default TechnicianPublicProfileView;
