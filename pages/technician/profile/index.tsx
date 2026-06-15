import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useReactiveVar } from '@apollo/client';
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
import WatchOutlined from '@mui/icons-material/WatchOutlined';
import CheckRounded from '@mui/icons-material/CheckRounded';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { userVar } from '../../../apollo/store';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

const STORIES = [
	{ label: 'Screen Fix', color: '#FF6B00', icon: <SmartphoneOutlined style={{ fontSize: 24 }} /> },
	{ label: 'MacBook', color: '#3B82F6', icon: <LaptopMacOutlined style={{ fontSize: 24 }} /> },
	{ label: 'Water DMG', color: '#A855F7', icon: <SmartphoneOutlined style={{ fontSize: 24 }} /> },
	{ label: 'iPad Pro', color: '#22C55E', icon: <TabletMacOutlined style={{ fontSize: 24 }} /> },
	{ label: 'Battery', color: '#F59E0B', icon: <LaptopMacOutlined style={{ fontSize: 24 }} /> },
	{ label: 'Watch', color: '#EC4899', icon: <BoltOutlined style={{ fontSize: 24 }} /> },
];

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

const SERVICES = [
	{ title: 'Screen Replacement', devices: 'iPhone, iPad, MacBook', price: 'From $89', dur: '1–2 hrs', popular: true },
	{ title: 'Battery Replacement', devices: 'All Apple Devices', price: 'From $69', dur: '45 min', popular: false },
	{ title: 'Water Damage Recovery', devices: 'iPhone, MacBook', price: 'From $149', dur: '24–48 hrs', popular: false },
	{ title: 'Logic Board Repair', devices: 'MacBook, iMac', price: 'From $280', dur: '2–5 days', popular: false },
	{ title: 'Camera Module', devices: 'iPhone, iPad', price: 'From $99', dur: '1–3 hrs', popular: false },
	{ title: 'Charging Port', devices: 'iPhone, iPad, MacBook', price: 'From $59', dur: '30–60 min', popular: false },
];

const portfolioGlyph = (kind: string) => {
	const sx = { fontSize: 56, color: '#3A3A3A' } as const;
	switch (kind) {
		case 'laptop':
			return <LaptopMacOutlined style={sx} />;
		case 'tablet':
			return <TabletMacOutlined style={sx} />;
		case 'watch':
			return <WatchOutlined style={sx} />;
		default:
			return <SmartphoneOutlined style={sx} />;
	}
};

const PORTFOLIO = [
	{ kind: 'phone', title: 'iPhone 15 Pro Max — Screen', sub: 'OLED display restored', stars: 5, client: 'Sarah M.' },
	{ kind: 'laptop', title: 'MacBook Pro 16" — Logic Board', sub: 'GPU reflow + solder repair', stars: 5, client: 'David K.' },
	{ kind: 'tablet', title: 'iPad Pro 12.9" — Screen', sub: 'Genuine Apple display', stars: 5, client: 'Lily C.' },
	{ kind: 'phone', title: 'iPhone 14 Plus — Water Damage', sub: 'Full motherboard cleaning', stars: 5, client: 'Daniel W.' },
	{ kind: 'laptop', title: 'MacBook Air M2 — Battery', sub: 'OEM battery, 100% health', stars: 5, client: 'Emma R.' },
	{ kind: 'watch', title: 'Apple Watch Ultra — Screen', sub: 'Sapphire crystal replaced', stars: 4, client: 'Marcus L.' },
];

const RATING_DIST = [
	{ star: 5, pct: 87 },
	{ star: 4, pct: 10 },
	{ star: 3, pct: 2 },
	{ star: 2, pct: 1 },
	{ star: 1, pct: 0 },
];

const REVIEWS = [
	{
		initials: 'SJ',
		color: '#B4533F',
		name: 'Sarah Johnson',
		stars: 5,
		date: 'Jun 14, 2026',
		device: 'iPhone 14 Pro',
		text: 'Alex is an absolute professional. Fixed my cracked screen in under an hour and it looks brand new. His workspace is super clean and organized. 10/10 would highly recommend.',
	},
	{
		initials: 'MC',
		color: '#4CAF50',
		name: 'Michael Chen',
		stars: 5,
		date: 'Jun 12, 2026',
		device: 'MacBook Pro M3',
		text: 'Fast, reliable, and affordable. Brought in my MacBook with a dead battery and Alex had it fixed same day. Even cleaned the keyboard while he was at it!',
	},
	{
		initials: 'EW',
		color: '#7C6FF0',
		name: 'Emma Williams',
		stars: 5,
		date: 'Jun 9, 2026',
		device: 'iPad Pro 12.9"',
		text: 'Brought my water-damaged iPad in expecting the worst. Alex recovered everything and it works perfectly now. Genuinely impressed with the communication throughout.',
	},
];

const Stars = ({ count }: { count: number }) => (
	<>
		{Array.from({ length: 5 }).map((_, i) => (
			<StarRounded key={i} style={{ fontSize: 14, color: i < count ? '#F59E0B' : '#3A3A3A' }} />
		))}
	</>
);

const PublicProfile: NextPage = () => {
	const user = useReactiveVar(userVar);
	const [activeTab, setActiveTab] = useState('Overview');

	const name = user?.userNickname || 'Alex Kim';
	const initials = useMemo(() => {
		const parts = name.trim().split(/\s+/);
		return ((parts[0]?.[0] || 'A') + (parts[1]?.[0] || parts[0]?.[1] || 'K')).toUpperCase();
	}, [name]);

	return (
		<div className="fixora-pp-page">
			{/* Profile header */}
			<div className="fixora-pp-header">
				<div className="fixora-pp-header__avatar-wrap">
					<div className="fixora-pp-header__avatar">{initials}</div>
					<span className="fixora-pp-header__online" />
				</div>

				<div className="fixora-pp-header__main">
					<div className="fixora-pp-header__name-row">
						<h1 className="fixora-pp-header__name">{name}</h1>
						<VerifiedRounded style={{ fontSize: 22, color: '#3B82F6' }} />
					</div>
					<div className="fixora-pp-header__role">Pro Technician · Apple Device Specialist</div>
					<div className="fixora-pp-header__loc">
						<LocationOnOutlined style={{ fontSize: 16 }} />
						San Francisco Bay Area, CA
					</div>

					<div className="fixora-pp-stats">
						<div className="fixora-pp-stat">
							<div className="fixora-pp-stat__label">
								<StarRounded style={{ fontSize: 15, color: '#F59E0B' }} /> Rating
							</div>
							<div className="fixora-pp-stat__value">
								4.9<span className="fixora-pp-stat__unit">/5.0</span>
							</div>
						</div>
						<div className="fixora-pp-stat">
							<div className="fixora-pp-stat__label">
								<ThumbUpAltOutlined style={{ fontSize: 14, color: '#3B82F6' }} /> Reviews
							</div>
							<div className="fixora-pp-stat__value">214</div>
						</div>
						<div className="fixora-pp-stat">
							<div className="fixora-pp-stat__label">
								<CheckCircleOutline style={{ fontSize: 14, color: '#22C55E' }} /> Completed
							</div>
							<div className="fixora-pp-stat__value">
								203<span className="fixora-pp-stat__unit">jobs</span>
							</div>
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
					<button className="fixora-pp-btn fixora-pp-btn--primary" type="button">
						<ChatBubbleOutlineOutlined style={{ fontSize: 17 }} /> Message Me
					</button>
					<button className="fixora-pp-btn fixora-pp-btn--ghost" type="button">
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
					<div className="fixora-pp-story">
						<button className="fixora-pp-story__add" type="button">
							<AddRounded style={{ fontSize: 24 }} />
						</button>
						<span className="fixora-pp-story__label fixora-pp-story__label--add">Add Story</span>
					</div>
					{STORIES.map((s) => (
						<div key={s.label} className="fixora-pp-story">
							<button className="fixora-pp-story__ring" style={{ borderColor: s.color, color: s.color }} type="button">
								<span className="fixora-pp-story__icon">{s.icon}</span>
								<span className="fixora-pp-story__badge" style={{ background: s.color }} />
							</button>
							<span className="fixora-pp-story__label">{s.label}</span>
						</div>
					))}
				</div>
			</div>

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
						<p className="fixora-pp-panel__text">
							Apple-certified technician with 8+ years of experience specializing in iPhone, iPad, MacBook, and
							Apple Watch repairs. I run a professional home workshop with all the proper tools — hot air stations,
							ultrasonic cleaners, microscope, and genuine Apple parts sourced directly from authorized suppliers.
						</p>
						<p className="fixora-pp-panel__text">
							Every repair comes with a 90-day warranty and I provide transparent communication throughout the
							entire process. My goal is to get your device working like new, every single time.
						</p>
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
				<div className="fixora-pp-services">
					{SERVICES.map((s) => (
						<div key={s.title} className={`fixora-pp-service ${s.popular ? 'fixora-pp-service--popular' : ''}`}>
							{s.popular && <span className="fixora-pp-service__badge">POPULAR</span>}
							<div className="fixora-pp-service__title">{s.title}</div>
							<div className="fixora-pp-service__devices">{s.devices}</div>
							<div className="fixora-pp-service__foot">
								<div>
									<div className="fixora-pp-service__price">{s.price}</div>
									<div className="fixora-pp-service__dur">
										<AccessTimeOutlined style={{ fontSize: 13 }} /> {s.dur}
									</div>
								</div>
								<button className="fixora-pp-service__book" type="button">Book Now</button>
							</div>
						</div>
					))}
				</div>
			)}

			{activeTab === 'Portfolio' && (
				<div className="fixora-pp-portfolio">
					{PORTFOLIO.map((p) => (
						<div key={p.title} className="fixora-pp-port">
							<div className="fixora-pp-port__media">{portfolioGlyph(p.kind)}</div>
							<div className="fixora-pp-port__body">
								<div className="fixora-pp-port__title">{p.title}</div>
								<div className="fixora-pp-port__sub">{p.sub}</div>
								<div className="fixora-pp-port__foot">
									<span className="fixora-pp-port__stars"><Stars count={p.stars} /></span>
									<span className="fixora-pp-port__client">{p.client}</span>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{activeTab === 'Reviews' && (
				<div className="fixora-pp-reviews">
					<div className="fixora-pp-panel fixora-pp-rsummary">
						<div className="fixora-pp-rsummary__score">
							<div className="fixora-pp-rsummary__num">4.9</div>
							<div className="fixora-pp-rsummary__stars"><Stars count={5} /></div>
							<div className="fixora-pp-rsummary__count">214 reviews</div>
						</div>
						<div className="fixora-pp-rsummary__bars">
							{RATING_DIST.map((d) => (
								<div key={d.star} className="fixora-pp-rbar">
									<span className="fixora-pp-rbar__star">{d.star} <StarRounded style={{ fontSize: 12, color: '#F59E0B' }} /></span>
									<span className="fixora-pp-rbar__track">
										<span className="fixora-pp-rbar__fill" style={{ width: `${d.pct}%` }} />
									</span>
									<span className="fixora-pp-rbar__pct">{d.pct}%</span>
								</div>
							))}
						</div>
					</div>

					{REVIEWS.map((r) => (
						<div key={r.name} className="fixora-pp-panel fixora-pp-review">
							<div className="fixora-pp-review__head">
								<div className="fixora-pp-review__avatar" style={{ background: r.color }}>{r.initials}</div>
								<div className="fixora-pp-review__id">
									<div className="fixora-pp-review__name-row">
										<span className="fixora-pp-review__name">{r.name}</span>
										<span className="fixora-pp-review__verified"><CheckRounded style={{ fontSize: 13 }} /> Verified</span>
									</div>
									<div className="fixora-pp-review__stars"><Stars count={r.stars} /></div>
								</div>
								<div className="fixora-pp-review__meta">
									<div className="fixora-pp-review__date">{r.date}</div>
									<div className="fixora-pp-review__device">{r.device}</div>
								</div>
							</div>
							<p className="fixora-pp-review__text">{r.text}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default withTechnicianLayout(PublicProfile);
