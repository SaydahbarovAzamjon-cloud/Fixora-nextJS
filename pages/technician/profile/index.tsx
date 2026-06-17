import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import VerifiedRounded from '@mui/icons-material/VerifiedRounded';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import StarRounded from '@mui/icons-material/StarRounded';
import ThumbUpAltOutlined from '@mui/icons-material/ThumbUpAltOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import AddRounded from '@mui/icons-material/AddRounded';
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
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { userVar } from '../../../apollo/store';
import { GET_USER, GET_TECHNICIAN_REVIEWS } from '../../../apollo/user/query';
import { GET_MY_ARTICLES, GET_USER_FOLLOWERS } from '../../../apollo/user/profile';
import { GET_TECHNICIAN_STORIES } from '../../../apollo/user/story';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import TechTipCard from '../../../libs/components/homepage/TechTipCard';
import CreateStoryModal from '../../../libs/components/technician/CreateStoryModal';
import { Article, ArticleSummary, Story, TechnicianReview } from '../../../libs/types/fixora/fixora';
import { T } from '../../../libs/types/common';
import { Messages, REACT_APP_API_URL } from '../../../libs/config';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

const STORY_COLORS = ['#FF6B00', '#3B82F6', '#A855F7', '#22C55E', '#F59E0B', '#EC4899'];

const storyImageUrl = (url?: string): string => {
	if (!url) return '';
	return url.startsWith('http') ? url : `${REACT_APP_API_URL}/${url}`;
};

const TABS = ['Overview', 'Services', 'Portfolio', 'Reviews'];

const CREDENTIALS = [
	{ color: '#FF6B00', verified: false, title: 'Top Technician', sub: 'Top 5% on FIXORA', icon: <EmojiEventsOutlined style={{ fontSize: 20 }} /> },
	{ color: '#3B82F6', verified: true, title: 'Verified Pro', sub: 'ID & skills verified', icon: <VerifiedRounded style={{ fontSize: 20 }} /> },
	{ color: '#FF6B00', verified: false, title: '200+ Repairs', sub: 'Completion milestone', icon: <BoltOutlined style={{ fontSize: 20 }} /> },
	{ color: '#22C55E', verified: false, title: '5-Star Rated', sub: '4.9 avg. rating', icon: <StarRounded style={{ fontSize: 20 }} /> },
	{ color: '#A855F7', verified: false, title: 'Fast Response', sub: '<15 min avg reply', icon: <AccessTimeOutlined style={{ fontSize: 19 }} /> },
	{ color: '#3B82F6', verified: true, title: 'Certified Repair', sub: 'Apple authorized', icon: <GppGoodOutlined style={{ fontSize: 20 }} /> },
];

const SPECIALIZATIONS = [
	{ color: '#FF6B00', title: 'iPhone', sub: 'All models from iPhone 6 to 15 Pro Max', jobs: '112 jobs', icon: <SmartphoneOutlined style={{ fontSize: 20 }} /> },
	{ color: '#C8C8C8', title: 'MacBook', sub: 'Air, Pro, M1/M2/M3 chip models', jobs: '67 jobs', icon: <LaptopMacOutlined style={{ fontSize: 20 }} /> },
	{ color: '#FF6B00', title: 'iPad', sub: 'All iPad models including Pro', jobs: '24 jobs', icon: <TabletMacOutlined style={{ fontSize: 20 }} /> },
];

const RATING_STARS = [5, 4, 3, 2, 1];

const Stars = ({ count }: { count: number }) => (
	<>
		{Array.from({ length: 5 }).map((_, i) => (
			<StarRounded key={i} style={{ fontSize: 14, color: i < count ? '#F59E0B' : '#3A3A3A' }} />
		))}
	</>
);

const toArticleSummary = (a: Article): ArticleSummary => ({
	_id: a._id,
	articleCategory: a.articleCategory ?? undefined,
	articleTitle: a.articleTitle,
	articleExcerpt: a.articleExcerpt ?? undefined,
	articleImage: a.articleImage ?? undefined,
	articleLikes: a.articleLikes,
	articleViews: a.articleViews,
	articleComments: a.articleComments,
	createdAt: a.createdAt,
});

const initialsOf = (value: string): string => {
	const parts = value.trim().split(/\s+/);
	return ((parts[0]?.[0] || '?') + (parts[1]?.[0] || parts[0]?.[1] || '')).toUpperCase();
};

const formatDate = (value?: string): string => {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const reviewStars = (r: TechnicianReview): number =>
	Math.round(((r.repairQuality ?? 0) + (r.repairSpeed ?? 0) + (r.communication ?? 0)) / 3);

const PublicProfile: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [activeTab, setActiveTab] = useState('Overview');
	const [storyModalOpen, setStoryModalOpen] = useState(false);
	const technicianId = user?._id;

	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	// Real technician profile
	const { data: userData, refetch: refetchUser } = useQuery(GET_USER, {
		variables: { userId: technicianId },
		skip: !technicianId,
		fetchPolicy: 'cache-and-network',
	});
	const profile = (userData as T)?.getUser;

	// Articles authored by the current technician
	const { data: articlesData } = useQuery(GET_MY_ARTICLES, {
		variables: { input: { page: 1, limit: 6, search: {} } },
		skip: !technicianId,
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
	});
	const myArticles: Article[] = (articlesData as T)?.getMyArticles?.list ?? [];

	// Reviews for this technician
	const { data: reviewsData, loading: reviewsLoading } = useQuery(GET_TECHNICIAN_REVIEWS, {
		variables: {
			input: { page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: { technicianId: technicianId ?? '' } },
		},
		skip: !technicianId,
		fetchPolicy: 'cache-and-network',
	});
	const reviews: TechnicianReview[] = (reviewsData as T)?.getTechnicianReviews?.list ?? [];
	const distribution: { star: number; count: number }[] = (reviewsData as T)?.getTechnicianReviews?.distribution ?? [];
	// Real review total from the query (User.reviewCount may be stale/seeded)
	const reviewsTotal: number = (reviewsData as T)?.getTechnicianReviews?.metaCounter?.[0]?.total ?? reviews.length;

	// Followers of this technician
	const { data: followersData } = useQuery(GET_USER_FOLLOWERS, {
		variables: { input: { page: 1, limit: 24, search: { followingId: technicianId ?? '' } } },
		skip: !technicianId,
		fetchPolicy: 'cache-and-network',
	});
	const followerList: T[] = (followersData as T)?.getUserFollowers?.list ?? [];
	// Real follower total from the query (User.followersCount may be stale/seeded)
	const followersTotal: number = (followersData as T)?.getUserFollowers?.metaCounter?.[0]?.total ?? followerList.length;

	const name = profile?.userNickname || profile?.userFullName || user?.userNickname || 'Technician';
	const profileImage = profile?.userProfileImage || user?.userProfileImage || '';
	const specialty: string = profile?.specialty || '';
	const location: string = profile?.userLocation || '';
	const rating = profile?.averageRating ?? 0;
	const completed = profile?.completedJobsCount ?? 0;
	const isOnline = profile?.isOnline === true;
	const isVerified = profile?.isVerified === true;
	const bio: string | undefined = profile?.userBio;
	const isFollowing = !!profile?.meFollowed?.[0]?.myFollowing;
	const services: { title: string; basePrice: number }[] = profile?.services ?? [];
	const portfolioImages: string[] = profile?.portfolioImages ?? [];

	// 24h Repair Stories for this technician
	const { data: storiesData, refetch: refetchStories } = useQuery(GET_TECHNICIAN_STORIES, {
		variables: { input: { technicianId: technicianId ?? '', limit: 20 } },
		skip: !technicianId,
		fetchPolicy: 'cache-and-network',
	});
	const stories: Story[] = (storiesData as T)?.getTechnicianStories?.list ?? [];

	// Only an APPROVED technician may post stories (server also enforces this)
	const canCreateStory = profile?.userType === 'TECHNICIAN' && profile?.verificationStatus === 'APPROVED';

	const initials = useMemo(() => initialsOf(name), [name]);

	// ---- Handlers (functional buttons) ----
	const messageHandler = () => router.push('/technician/messages');

	const viewLiveProfileHandler = () => {
		if (technicianId) window.open(`/technicians/${technicianId}`, '_blank', 'noopener,noreferrer');
	};

	const toggleFollowHandler = async () => {
		try {
			if (!technicianId) throw new Error(Messages.error2);
			if (isFollowing) {
				await unsubscribe({ variables: { input: technicianId } });
			} else {
				await subscribe({ variables: { input: technicianId } });
				await sweetTopSmallSuccessAlert('Followed', 800);
			}
			await refetchUser();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const bookServiceHandler = () => {
		if (technicianId) router.push(`/technicians/${technicianId}/book`);
	};

	return (
		<div className="fixora-pp-page">
			{/* Profile header */}
			<div className="fixora-pp-header">
				<div className="fixora-pp-header__avatar-wrap">
					<div className="fixora-pp-header__avatar">
						{profileImage ? <img src={profileImage} alt={name} /> : initials}
					</div>
					{isOnline && <span className="fixora-pp-header__online" />}
				</div>

				<div className="fixora-pp-header__main">
					<div className="fixora-pp-header__name-row">
						<h1 className="fixora-pp-header__name">{name}</h1>
						{isVerified && <VerifiedRounded style={{ fontSize: 22, color: '#3B82F6' }} />}
					</div>
					<div className="fixora-pp-header__role">Pro Technician{specialty ? ` · ${specialty}` : ''}</div>
					{location && (
						<div className="fixora-pp-header__loc">
							<LocationOnOutlined style={{ fontSize: 16 }} />
							{location}
						</div>
					)}

					<div className="fixora-pp-stats">
						<div className="fixora-pp-stat">
							<div className="fixora-pp-stat__label">
								<StarRounded style={{ fontSize: 15, color: '#F59E0B' }} /> Rating
							</div>
							<div className="fixora-pp-stat__value">
								{rating}<span className="fixora-pp-stat__unit">/5.0</span>
							</div>
						</div>
						<div className="fixora-pp-stat">
							<div className="fixora-pp-stat__label">
								<ThumbUpAltOutlined style={{ fontSize: 14, color: '#3B82F6' }} /> Reviews
							</div>
							<div className="fixora-pp-stat__value">{reviewsTotal}</div>
						</div>
						<div className="fixora-pp-stat">
							<div className="fixora-pp-stat__label">
								<CheckCircleOutline style={{ fontSize: 14, color: '#22C55E' }} /> Completed
							</div>
							<div className="fixora-pp-stat__value">
								{completed}<span className="fixora-pp-stat__unit">jobs</span>
							</div>
						</div>
						<div className="fixora-pp-stat">
							<div className="fixora-pp-stat__label">
								<GroupOutlined style={{ fontSize: 14, color: '#EC4899' }} /> Followers
							</div>
							<div className="fixora-pp-stat__value">{followersTotal}</div>
						</div>
						<div className="fixora-pp-stat">
							<div className="fixora-pp-stat__label">
								<AccessTimeOutlined style={{ fontSize: 14, color: '#A855F7' }} /> Response
							</div>
							<div className="fixora-pp-stat__value">&lt;15m</div>
						</div>
					</div>
				</div>

				<div className="fixora-pp-header__actions">
					<button className="fixora-pp-btn fixora-pp-btn--primary" type="button" onClick={messageHandler}>
						<ChatBubbleOutlineOutlined style={{ fontSize: 17 }} /> Message Me
					</button>
					<button className="fixora-pp-btn fixora-pp-btn--ghost" type="button" onClick={toggleFollowHandler}>
						{isFollowing ? (
							<>
								<HowToRegOutlined style={{ fontSize: 16 }} /> Following
							</>
						) : (
							<>
								<PersonAddAlt1Outlined style={{ fontSize: 16 }} /> Follow
							</>
						)}
					</button>
					<button className="fixora-pp-btn fixora-pp-btn--ghost" type="button" onClick={viewLiveProfileHandler}>
						<OpenInNewOutlined style={{ fontSize: 16 }} /> View Live Profile
					</button>
				</div>
			</div>

			{/* Repair Stories */}
			<div className="fixora-pp-stories-card">
				<div className="fixora-pp-stories-card__head">
					<h2 className="fixora-pp-stories-card__title">Repair Stories</h2>
					<div className="fixora-pp-stories-card__live">
						<span className="fixora-pp-stories-card__live-dot" /> Live Portfolio
					</div>
				</div>
				<div className="fixora-pp-stories">
					{canCreateStory && (
						<div className="fixora-pp-story">
							<button className="fixora-pp-story__add" type="button" onClick={() => setStoryModalOpen(true)}>
								<AddRounded style={{ fontSize: 24 }} />
							</button>
							<span className="fixora-pp-story__label fixora-pp-story__label--add">Add Story</span>
						</div>
					)}
					{stories.map((s, i) => {
						const color = STORY_COLORS[i % STORY_COLORS.length];
						const cover = storyImageUrl(s.images?.[0]?.url);
						const label = s.caption?.trim() || formatDate(s.createdAt);
						return (
							<div key={s._id} className="fixora-pp-story">
								<button className="fixora-pp-story__ring" style={{ borderColor: color }} type="button">
									{cover ? (
										<img className="fixora-pp-story__cover" src={cover} alt="" />
									) : (
										<span className="fixora-pp-story__icon" style={{ color }}>
											<BoltOutlined style={{ fontSize: 24 }} />
										</span>
									)}
									<span className="fixora-pp-story__badge" style={{ background: color }} />
								</button>
								<span className="fixora-pp-story__label">{label}</span>
							</div>
						);
					})}
					{!canCreateStory && stories.length === 0 && (
						<span className="fixora-pp-stories__empty">No stories yet.</span>
					)}
				</div>
			</div>

			<CreateStoryModal open={storyModalOpen} onClose={() => setStoryModalOpen(false)} onCreated={() => refetchStories()} />

			{/* Tabs */}
			<div className="fixora-pp-tabs">
				{TABS.map((tab) => (
					<button
						key={tab}
						className={`fixora-pp-tab ${activeTab === tab ? 'fixora-pp-tab--active' : ''}`}
						onClick={() => setActiveTab(tab)}
						type="button"
					>
						{tab}
					</button>
				))}
			</div>

			{/* Tab content */}
			{activeTab === 'Overview' && (
				<>
					<div className="fixora-pp-panel">
						<h3 className="fixora-pp-panel__title">About</h3>
						{bio ? (
							<p className="fixora-pp-panel__text">{bio}</p>
						) : (
							<p className="fixora-pp-panel__text">This technician has not added a bio yet.</p>
						)}
					</div>

					{/* My Articles */}
					<div className="fixora-pp-panel">
						<h3 className="fixora-pp-panel__title">My Articles</h3>
						{myArticles.length > 0 ? (
							<div className="fixora-home-tips__grid">
								{myArticles.map((article) => (
									<TechTipCard key={article._id} article={toArticleSummary(article)} />
								))}
							</div>
						) : (
							<div className="fixora-pp-empty">
								<div className="fixora-pp-empty__icon">
									<ArticleOutlined style={{ fontSize: 26 }} />
								</div>
								<div className="fixora-pp-empty__title">No Articles Yet</div>
								<div className="fixora-pp-empty__sub">This technician has not published any articles yet.</div>
							</div>
						)}
					</div>

					{/* Followers */}
					<div className="fixora-pp-panel">
						<h3 className="fixora-pp-panel__title">Followers ({followersTotal})</h3>
						{followerList.length > 0 ? (
							<div className="fixora-pp-followers">
								{followerList.map((f) => {
									const fd = f.followerData || {};
									const fName = fd.userNickname || fd.userFullName || 'User';
									return (
										<div key={f._id} className="fixora-pp-follower">
											<div className="fixora-pp-follower__avatar">
												{fd.userProfileImage ? (
													<img src={fd.userProfileImage} alt={fName} />
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
								<div className="fixora-pp-empty__title">No Followers Yet</div>
								<div className="fixora-pp-empty__sub">This technician has no followers yet.</div>
							</div>
						)}
					</div>

					<div className="fixora-pp-row">
						<div className="fixora-pp-panel">
							<h3 className="fixora-pp-panel__title">Trust &amp; Credentials</h3>
							<div className="fixora-pp-creds">
								{CREDENTIALS.map((c) => (
									<div key={c.title} className="fixora-pp-cred">
										<div className="fixora-pp-cred__icon" style={{ background: `${c.color}1f`, color: c.color }}>
											{c.icon}
										</div>
										<div className="fixora-pp-cred__body">
											<div className="fixora-pp-cred__title">{c.title}</div>
											<div className="fixora-pp-cred__sub">{c.sub}</div>
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
							<h3 className="fixora-pp-panel__title">Specializations</h3>
							<div className="fixora-pp-specs">
								{SPECIALIZATIONS.map((s) => (
									<div key={s.title} className="fixora-pp-spec">
										<div className="fixora-pp-spec__icon" style={{ background: `${s.color}1f`, color: s.color }}>
											{s.icon}
										</div>
										<div className="fixora-pp-spec__body">
											<div className="fixora-pp-spec__title">{s.title}</div>
											<div className="fixora-pp-spec__sub">{s.sub}</div>
										</div>
										<div className="fixora-pp-spec__jobs">{s.jobs}</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</>
			)}

			{activeTab === 'Services' && (
				services.length > 0 ? (
					<div className="fixora-pp-services">
						{services.map((s, i) => (
							<div key={`${s.title}-${i}`} className="fixora-pp-service">
								<div className="fixora-pp-service__title">{s.title}</div>
								<div className="fixora-pp-service__foot">
									<div>
										<div className="fixora-pp-service__price">From ${s.basePrice}</div>
									</div>
									<button className="fixora-pp-service__book" type="button" onClick={bookServiceHandler}>Book Now</button>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="fixora-pp-empty">
						<div className="fixora-pp-empty__icon">
							<BuildOutlined style={{ fontSize: 26 }} />
						</div>
						<div className="fixora-pp-empty__title">No Services Yet</div>
						<div className="fixora-pp-empty__sub">This technician has not added any services yet.</div>
					</div>
				)
			)}

			{activeTab === 'Portfolio' && (
				portfolioImages.length > 0 ? (
					<div className="fixora-pp-portfolio">
						{portfolioImages.map((img, i) => (
							<div key={`${img}-${i}`} className="fixora-pp-port">
								<div className="fixora-pp-port__media fixora-pp-port__media--image">
									<img src={img} alt="" />
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="fixora-pp-empty">
						<div className="fixora-pp-empty__icon">
							<PhotoLibraryOutlined style={{ fontSize: 26 }} />
						</div>
						<div className="fixora-pp-empty__title">No Portfolio Yet</div>
						<div className="fixora-pp-empty__sub">This technician has not added any portfolio work yet.</div>
					</div>
				)
			)}

			{activeTab === 'Reviews' && (
				reviewsLoading && reviews.length === 0 ? (
					<div className="fixora-pp-empty">
						<div className="fixora-pp-empty__title">Loading…</div>
					</div>
				) : reviews.length > 0 ? (
					<div className="fixora-pp-reviews">
						<div className="fixora-pp-panel fixora-pp-rsummary">
							<div className="fixora-pp-rsummary__score">
								<div className="fixora-pp-rsummary__num">{rating}</div>
								<div className="fixora-pp-rsummary__stars"><Stars count={Math.round(rating)} /></div>
								<div className="fixora-pp-rsummary__count">{reviewsTotal} reviews</div>
							</div>
							<div className="fixora-pp-rsummary__bars">
								{RATING_STARS.map((star) => {
									const count = distribution.find((d) => d.star === star)?.count ?? 0;
									const pct = reviewsTotal > 0 ? Math.round((count / reviewsTotal) * 100) : 0;
									return (
										<div key={star} className="fixora-pp-rbar">
											<span className="fixora-pp-rbar__star">{star} <StarRounded style={{ fontSize: 12, color: '#F59E0B' }} /></span>
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
							const cName = customer.userNickname || customer.userFullName || 'Customer';
							return (
								<div key={r._id} className="fixora-pp-panel fixora-pp-review">
									<div className="fixora-pp-review__head">
										<div className="fixora-pp-review__avatar" style={{ background: '#4CAF50' }}>
											{customer.userProfileImage ? (
												<img
													src={customer.userProfileImage}
													alt={cName}
													style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
												/>
											) : (
												initialsOf(cName)
											)}
										</div>
										<div className="fixora-pp-review__id">
											<div className="fixora-pp-review__name-row">
												<span className="fixora-pp-review__name">{cName}</span>
												<span className="fixora-pp-review__verified"><CheckRounded style={{ fontSize: 13 }} /> Verified</span>
											</div>
											<div className="fixora-pp-review__stars"><Stars count={reviewStars(r)} /></div>
										</div>
										<div className="fixora-pp-review__meta">
											<div className="fixora-pp-review__date">{formatDate(r.createdAt)}</div>
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
						<div className="fixora-pp-empty__title">No Reviews Yet</div>
						<div className="fixora-pp-empty__sub">This technician has not received any reviews yet.</div>
					</div>
				)
			)}
		</div>
	);
};

export default withTechnicianLayout(PublicProfile);
