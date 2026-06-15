import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { GET_INCOMING_REQUESTS } from '../../../apollo/user/profile';
import { ACCEPT_BOOKING, REJECT_BOOKING } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

const DEVICE_ICON: Record<string, string> = {
	IPHONE: '📱',
	APPLE_WATCH: '⌚',
	IPAD: '📱',
	MACBOOK: '💻',
};

const DEVICE_LABEL: Record<string, string> = {
	IPHONE: 'iPhone',
	APPLE_WATCH: 'Apple Watch',
	IPAD: 'iPad',
	MACBOOK: 'MacBook',
};

const ISSUE_LABEL: Record<string, string> = {
	BATTERY: 'Battery',
	CHARGING: 'Charging',
	GENERAL: 'General',
	KEYBOARD: 'Keyboard',
	SCREEN: 'Screen',
	SOFTWARE: 'Software',
	WATER_DAMAGE: 'Water Damage',
};

const deviceIcon = (deviceType?: string | null) => DEVICE_ICON[deviceType ?? ''] ?? '🔧';
const deviceLabel = (deviceType?: string | null) => DEVICE_LABEL[deviceType ?? ''] ?? 'Device';
const issueLabel = (issueCategory?: string | null) => ISSUE_LABEL[issueCategory ?? ''] ?? 'General';

const urgencyInfo = (complexity?: string | null) => {
	switch (complexity) {
		case 'HIGH':
			return { label: 'Urgent', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' };
		case 'LOW':
			return { label: 'Low', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' };
		default:
			return { label: 'Medium', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
	}
};

const timeAgo = (dateStr?: string | null) => {
	if (!dateStr) return '';
	const date = new Date(dateStr);
	const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
	if (minutes < 1) return 'just now';
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
};

const FILTERS = [
	{ id: 'all', label: 'All' },
	{ id: 'urgent', label: 'Urgent' },
	{ id: 'medium', label: 'Medium' },
	{ id: 'low', label: 'Low' },
	{ id: 'IPHONE', label: 'iPhone' },
	{ id: 'MACBOOK', label: 'MacBook' },
	{ id: 'IPAD', label: 'iPad' },
	{ id: 'APPLE_WATCH', label: 'Apple Watch' },
];

const IncomingRequests: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [search, setSearch] = useState('');
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [activeFilter, setActiveFilter] = useState<string>('all');

	const { data: requestsData, refetch } = useQuery(GET_INCOMING_REQUESTS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 100, search: {} } },
		fetchPolicy: 'network-only',
	});

	const [acceptBooking, { loading: accepting }] = useMutation(ACCEPT_BOOKING);
	const [rejectBooking, { loading: rejecting }] = useMutation(REJECT_BOOKING);

	const incomingRequests = useMemo(
		() => requestsData?.getIncomingRequests?.list ?? [],
		[requestsData]
	);

	const filtered = useMemo(() => {
		let result = incomingRequests.filter((b: any) =>
			(b.problemTitle || '').toLowerCase().includes(search.toLowerCase())
		);

		if (activeFilter === 'urgent') result = result.filter((b: any) => b.aiClassification?.repairComplexity === 'HIGH');
		else if (activeFilter === 'medium') result = result.filter((b: any) => b.aiClassification?.repairComplexity === 'MEDIUM');
		else if (activeFilter === 'low') result = result.filter((b: any) => b.aiClassification?.repairComplexity === 'LOW');
		else if (activeFilter !== 'all') result = result.filter((b: any) => b.aiClassification?.deviceType === activeFilter);

		return result;
	}, [incomingRequests, search, activeFilter]);

	const displayedBooking = useMemo(
		() => filtered.find((b: any) => b._id === selectedId) ?? filtered[0] ?? null,
		[filtered, selectedId]
	);

	const handleAccept = async (bookingId: string) => {
		try {
			await acceptBooking({ variables: { bookingId } });
			await refetch();
			setSelectedId(null);
		} catch (err) {
			console.error('acceptBooking error', err);
		}
	};

	const handleDecline = async (bookingId: string) => {
		if (!window.confirm('Decline this request?')) return;
		try {
			await rejectBooking({ variables: { bookingId } });
			await refetch();
			setSelectedId(null);
		} catch (err) {
			console.error('rejectBooking error', err);
		}
	};

	return (
		<div className="fixora-requests-page">
			{/* Left Pane: Request List */}
			<div className="fixora-requests-left">
				<div className="fixora-requests-search-wrap">
					<div className="fixora-requests-search">
						<span className="fixora-requests-search__icon">🔍</span>
						<input
							type="text"
							placeholder="Search requests..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
						{search && (
							<button className="fixora-requests-search__clear" onClick={() => setSearch('')}>
								×
							</button>
						)}
					</div>

					<div className="fixora-requests-filters">
						{FILTERS.map((f) => (
							<button
								key={f.id}
								className={`fixora-requests-filter ${activeFilter === f.id ? 'fixora-requests-filter--active' : ''}`}
								onClick={() => setActiveFilter(f.id)}
							>
								{f.label}
							</button>
						))}
					</div>
				</div>

				<div className="fixora-requests-list">
					{filtered.length === 0 ? (
						<div className="fixora-requests-empty">No requests found</div>
					) : (
						filtered.map((req: any) => {
							const urgency = urgencyInfo(req.aiClassification?.repairComplexity);
							return (
								<div
									key={req._id}
									className={`fixora-request-card ${displayedBooking?._id === req._id ? 'fixora-request-card--active' : ''}`}
									onClick={() => setSelectedId(req._id)}
								>
									<div className="fixora-request-card__top">
										<div className="fixora-request-card__icon">{deviceIcon(req.aiClassification?.deviceType)}</div>
										<div className="fixora-request-card__info">
											<div className="fixora-request-card__title-row">
												<span className="fixora-request-card__name">Customer</span>
												<span className="fixora-request-card__dot">•</span>
												<span className="fixora-request-card__id">#{req._id.slice(-6).toUpperCase()}</span>
											</div>
											<div className="fixora-request-card__device">{deviceLabel(req.aiClassification?.deviceType)}</div>
										</div>
										<span
											className="fixora-req-urgency-badge"
											style={{ color: urgency.color, background: urgency.bg }}
										>
											{urgency.label}
										</span>
									</div>
									<div className="fixora-request-card__issue">{req.problemTitle || req.problemDescription}</div>
									<div className="fixora-request-card__bottom">
										<span className="fixora-request-card__price">
											{req.estimatedPrice ? `$${parseFloat(req.estimatedPrice).toFixed(2)}` : '—'}
										</span>
										<span className="fixora-request-card__time">{timeAgo(req.createdAt)}</span>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>

			{/* Right Pane: Request Details */}
			<div className="fixora-requests-right">
				{displayedBooking ? (
					(() => {
						const urgency = urgencyInfo(displayedBooking.aiClassification?.repairComplexity);
						return (
							<div className="fixora-requests-detail">
								<div className="fixora-requests-detail__header">
									<div className="fixora-requests-detail__header-top">
										<div>
											<div className="fixora-requests-detail__meta">
												#{displayedBooking._id.slice(-6).toUpperCase()} • {timeAgo(displayedBooking.createdAt)}
											</div>
											<h2 className="fixora-requests-detail__title">{displayedBooking.problemTitle}</h2>
										</div>
										<span
											className="fixora-req-urgency-badge fixora-req-urgency-badge--lg"
											style={{ color: urgency.color, background: urgency.bg }}
										>
											{urgency.label}
										</span>
									</div>
									<div className="fixora-requests-detail__tags">
										<span className="fixora-requests-detail__tag">{deviceLabel(displayedBooking.aiClassification?.deviceType)}</span>
										<span className="fixora-requests-detail__tag">{issueLabel(displayedBooking.aiClassification?.issueCategory)}</span>
									</div>
								</div>

								<div className="fixora-requests-detail__grid">
									<div className="fixora-requests-detail__card">
										<div className="fixora-requests-detail__card-label">Client</div>
										<div className="fixora-requests-detail__entity">
											<div className="fixora-requests-detail__avatar">C</div>
											<div>
												<div className="fixora-requests-detail__entity-name">Customer</div>
												<div className="fixora-requests-detail__entity-sub">Booking #{displayedBooking._id.slice(-6).toUpperCase()}</div>
											</div>
										</div>
									</div>
									<div className="fixora-requests-detail__card">
										<div className="fixora-requests-detail__card-label">Device</div>
										<div className="fixora-requests-detail__entity">
											<div className="fixora-requests-detail__device-icon">{deviceIcon(displayedBooking.aiClassification?.deviceType)}</div>
											<div>
												<div className="fixora-requests-detail__entity-name">{deviceLabel(displayedBooking.aiClassification?.deviceType)}</div>
												<div className="fixora-requests-detail__entity-sub">{issueLabel(displayedBooking.aiClassification?.issueCategory)}</div>
											</div>
										</div>
										<div className="fixora-requests-detail__chips">
											<span className="fixora-requests-detail__chip fixora-requests-detail__chip--price">
												{displayedBooking.estimatedPrice ? `$${parseFloat(displayedBooking.estimatedPrice).toFixed(2)}` : 'No estimate'}
											</span>
										</div>
									</div>
								</div>

								<div className="fixora-requests-detail__description">
									<div className="fixora-requests-detail__card-label">Issue Description</div>
									<p>{displayedBooking.problemDescription || 'No description provided'}</p>
								</div>

								<div className="fixora-requests-detail__actions">
									<button
										className="fixora-requests-detail__btn fixora-requests-detail__btn--accept"
										disabled={accepting}
										onClick={() => handleAccept(displayedBooking._id)}
									>
										✓ Accept & Send Quote
									</button>
									<button
										className="fixora-requests-detail__btn fixora-requests-detail__btn--message"
										onClick={() => router.push('/technician/messages')}
									>
										💬 Message Client
									</button>
									<button
										className="fixora-requests-detail__btn fixora-requests-detail__btn--decline"
										disabled={rejecting}
										onClick={() => handleDecline(displayedBooking._id)}
									>
										× Decline
									</button>
								</div>
							</div>
						);
					})()
				) : (
					<div className="fixora-requests-detail__empty">Select a request to view details</div>
				)}
			</div>
		</div>
	);
};

export default withTechnicianLayout(IncomingRequests);
