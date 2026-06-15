import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import MoveToInboxOutlined from '@mui/icons-material/MoveToInboxOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import StarRounded from '@mui/icons-material/StarRounded';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import DoneAllRounded from '@mui/icons-material/DoneAllRounded';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

type NotifKind = 'requests' | 'messages' | 'payments' | 'reviews' | 'alerts';

interface Notif {
	id: number;
	kind: NotifKind;
	title: string;
	desc: string;
	time: string;
	action: string;
	unread: boolean;
}

const KIND_META: Record<NotifKind, { gradient: string; color: string; icon: React.ReactNode }> = {
	requests: {
		gradient: 'linear-gradient(135deg, #FF5A5A, #FF9A3C)',
		color: '#FF6B00',
		icon: <MoveToInboxOutlined style={{ fontSize: 22, color: '#fff' }} />,
	},
	messages: {
		gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
		color: '#A855F7',
		icon: <ChatBubbleOutlineOutlined style={{ fontSize: 21, color: '#fff' }} />,
	},
	payments: {
		gradient: 'linear-gradient(135deg, #22C55E, #16A34A)',
		color: '#22C55E',
		icon: <AttachMoneyOutlined style={{ fontSize: 22, color: '#fff' }} />,
	},
	reviews: {
		gradient: 'linear-gradient(135deg, #F59E0B, #FACC15)',
		color: '#F59E0B',
		icon: <StarRounded style={{ fontSize: 22, color: '#fff' }} />,
	},
	alerts: {
		gradient: 'linear-gradient(135deg, #EC4899, #D946EF)',
		color: '#EC4899',
		icon: <ErrorOutlineOutlined style={{ fontSize: 22, color: '#fff' }} />,
	},
};

const FILTERS: { id: 'all' | NotifKind; label: string }[] = [
	{ id: 'all', label: 'All' },
	{ id: 'requests', label: 'Requests' },
	{ id: 'messages', label: 'Messages' },
	{ id: 'payments', label: 'Payments' },
	{ id: 'reviews', label: 'Reviews' },
	{ id: 'alerts', label: 'Alerts' },
];

const INITIAL: Notif[] = [
	{ id: 1, kind: 'requests', title: 'New Repair Request', desc: 'Sarah Mitchell requested iPhone 15 Pro Max screen replacement — $180 budget', time: '12 min ago', action: 'View Request', unread: true },
	{ id: 2, kind: 'messages', title: 'New Message', desc: 'Daniel Wagner: "Is my phone ready? Any updates on the repair?"', time: '45 min ago', action: 'Reply', unread: true },
	{ id: 3, kind: 'payments', title: 'Payment Received', desc: 'Lily Chen paid $380 for iPad Pro screen replacement — JOB-879', time: '2h ago', action: 'View Receipt', unread: false },
	{ id: 4, kind: 'reviews', title: 'New 5-Star Review', desc: 'Michael Chen left a 5-star review: "Fast, reliable, and affordable. My MacBook is running like new again."', time: '3h ago', action: 'View Review', unread: true },
	{ id: 5, kind: 'alerts', title: 'Job Due Soon', desc: 'JOB-882 — Water damage recovery for Daniel Wagner is due in 2 hours', time: '4h ago', action: 'View Job', unread: false },
];

const Notifications: NextPage = () => {
	const [activeFilter, setActiveFilter] = useState<'all' | NotifKind>('all');
	const [notifs, setNotifs] = useState<Notif[]>(INITIAL);

	const unreadCount = useMemo(() => notifs.filter((n) => n.unread).length, [notifs]);

	const filtered = useMemo(
		() => (activeFilter === 'all' ? notifs : notifs.filter((n) => n.kind === activeFilter)),
		[notifs, activeFilter]
	);

	const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));

	return (
		<div className="fixora-notif-page">
			<div className="fixora-notif-header">
				<div>
					<div className="fixora-notif-header__title-row">
						<h2 className="fixora-notif-header__title">Notification Center</h2>
						{unreadCount > 0 && <span className="fixora-notif-header__badge">{unreadCount} new</span>}
					</div>
					<p className="fixora-notif-header__sub">Stay on top of your repair workflow</p>
				</div>
				<button className="fixora-notif-markall" onClick={markAllRead} type="button">
					<DoneAllRounded style={{ fontSize: 17 }} /> Mark all as read
				</button>
			</div>

			<div className="fixora-notif-filters">
				{FILTERS.map((f) => (
					<button
						key={f.id}
						className={`fixora-notif-filter ${activeFilter === f.id ? 'fixora-notif-filter--active' : ''}`}
						onClick={() => setActiveFilter(f.id)}
						type="button"
					>
						{f.label}
					</button>
				))}
			</div>

			<div className="fixora-notif-section-label">Today</div>

			<div className="fixora-notif-list">
				{filtered.length === 0 ? (
					<div className="fixora-notif-empty">No notifications</div>
				) : (
					filtered.map((n) => {
						const meta = KIND_META[n.kind];
						return (
							<div key={n.id} className={`fixora-notif-card ${n.unread ? 'fixora-notif-card--unread' : ''}`}>
								<div className="fixora-notif-card__icon" style={{ background: meta.gradient }}>
									{meta.icon}
								</div>
								<div className="fixora-notif-card__body">
									<div className="fixora-notif-card__top">
										<div className="fixora-notif-card__title">{n.title}</div>
										<div className="fixora-notif-card__time">{n.time}</div>
									</div>
									<div className="fixora-notif-card__desc">{n.desc}</div>
									<button
										className="fixora-notif-card__action"
										style={{ color: meta.color, borderColor: `${meta.color}55` }}
										type="button"
									>
										{n.action}
									</button>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

export default withTechnicianLayout(Notifications);
