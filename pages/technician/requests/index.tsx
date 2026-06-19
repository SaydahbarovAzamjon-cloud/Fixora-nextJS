import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { technicianPageProps } from '../../../libs/i18n/technicianPageProps';
import { formatTimeAgo } from '../../../libs/utils/i18nTime';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import SmartphoneOutlined from '@mui/icons-material/SmartphoneOutlined';
import TabletMacOutlined from '@mui/icons-material/TabletMacOutlined';
import LaptopMacOutlined from '@mui/icons-material/LaptopMacOutlined';
import WatchOutlined from '@mui/icons-material/WatchOutlined';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import StarRounded from '@mui/icons-material/StarRounded';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import CameraAltOutlined from '@mui/icons-material/CameraAltOutlined';
import PhotoCameraOutlined from '@mui/icons-material/PhotoCameraOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import HighlightOffOutlined from '@mui/icons-material/HighlightOffOutlined';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { formatKrw } from '../../../libs/utils/formatCurrency';
import { GET_INCOMING_REQUESTS } from '../../../apollo/user/profile';
import { ACCEPT_BOOKING, REJECT_BOOKING } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: await technicianPageProps(locale),
});

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

const DeviceGlyph = ({ type, size = 18, color = '#9A9A9A' }: { type?: string | null; size?: number; color?: string }) => {
	const sx = { fontSize: size, color } as const;
	switch (type) {
		case 'IPHONE':
			return <SmartphoneOutlined style={sx} />;
		case 'IPAD':
			return <TabletMacOutlined style={sx} />;
		case 'MACBOOK':
			return <LaptopMacOutlined style={sx} />;
		case 'APPLE_WATCH':
			return <WatchOutlined style={sx} />;
		default:
			return <BuildOutlined style={sx} />;
	}
};

const deviceLabel = (deviceType?: string | null) => DEVICE_LABEL[deviceType ?? ''] ?? 'Device';
const issueLabel = (issueCategory?: string | null) => ISSUE_LABEL[issueCategory ?? ''] ?? 'General';
const reqCode = (id: string) => `REQ-${id.slice(-4).toUpperCase()}`;

const urgencyInfo = (complexity: string | null | undefined, t: (k: string) => string) => {
	switch (complexity) {
		case 'HIGH':
			return { label: t('urgency.urgent'), color: '#EF4444', bg: 'rgba(239,68,68,0.12)' };
		case 'LOW':
			return { label: t('urgency.low'), color: '#22C55E', bg: 'rgba(34,197,94,0.12)' };
		default:
			return { label: t('urgency.medium'), color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
	}
};

const IncomingRequests: NextPage = () => {
	const { t } = useTranslation('technician');
	const router = useRouter();
	const locale = router.locale;
	const user = useReactiveVar(userVar);
	const FILTERS = [
		{ id: 'all', label: t('requests.filterAll') },
		{ id: 'urgent', label: t('requests.filterUrgent') },
		{ id: 'nearby', label: t('requests.filterNearby') },
		{ id: 'highbudget', label: t('requests.filterHighBudget') },
		{ id: 'IPHONE', label: 'iPhone' },
		{ id: 'MACBOOK', label: 'MacBook' },
		{ id: 'IPAD', label: 'iPad' },
	];
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
		else if (activeFilter === 'highbudget') result = result.filter((b: any) => (parseFloat(b.estimatedPrice) || 0) >= 200);
		else if (activeFilter === 'nearby') result = result; // distance data not available — shows all
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
			await sweetTopSmallSuccessAlert(t('requests.acceptedToast'), 1400);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const handleDecline = async (bookingId: string) => {
		if (!window.confirm(t('requests.declineConfirm'))) return;
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
						<SearchOutlined className="fixora-requests-search__icon" style={{ fontSize: 17 }} />
						<input
							type="text"
							placeholder={t('requests.searchPlaceholder')}
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
						<div className="fixora-requests-empty">{t('requests.noRequests')}</div>
					) : (
						filtered.map((req: any) => {
							const urgency = urgencyInfo(req.aiClassification?.repairComplexity, t);
							return (
								<div
									key={req._id}
									className={`fixora-request-card ${displayedBooking?._id === req._id ? 'fixora-request-card--active' : ''}`}
									onClick={() => setSelectedId(req._id)}
								>
									<div className="fixora-request-card__top">
										<div className="fixora-request-card__icon">
											<DeviceGlyph type={req.aiClassification?.deviceType} />
										</div>
										<div className="fixora-request-card__info">
											<div className="fixora-request-card__title-row">
												<span className="fixora-request-card__name">{t('requests.customer')}</span>
												<span className="fixora-request-card__dot">•</span>
												<span className="fixora-request-card__id">{reqCode(req._id)}</span>
											</div>
											<div className="fixora-request-card__device">{deviceLabel(req.aiClassification?.deviceType)}</div>
										</div>
										<span
											className="fixora-req-urgency-badge"
											style={{ color: urgency.color }}
										>
											{urgency.label}
										</span>
									</div>
									<div className="fixora-request-card__issue">{req.problemTitle || req.problemDescription}</div>
									<div className="fixora-request-card__bottom">
										<span className="fixora-request-card__price">
											{req.estimatedPrice ? formatKrw(parseFloat(req.estimatedPrice)) : '—'}
										</span>
										<span className="fixora-request-card__time">
											<AccessTimeOutlined style={{ fontSize: 13 }} />
											{formatTimeAgo(req.createdAt, t, locale)}
										</span>
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
						const urgency = urgencyInfo(displayedBooking.aiClassification?.repairComplexity, t);
						const priceLabel = displayedBooking.estimatedPrice
							? formatKrw(parseFloat(displayedBooking.estimatedPrice))
							: 'No estimate';
						return (
							<>
								<div className="fixora-requests-detail">
									<div className="fixora-requests-detail__header">
										<div className="fixora-requests-detail__header-top">
											<div>
												<div className="fixora-requests-detail__meta">
													{reqCode(displayedBooking._id)} • {formatTimeAgo(displayedBooking.createdAt, t, locale)}
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
											<span className="fixora-requests-detail__tag">{issueLabel(displayedBooking.aiClassification?.issueCategory)} Repair</span>
											<span className="fixora-requests-detail__tag">{deviceLabel(displayedBooking.aiClassification?.deviceType)}</span>
											<span className="fixora-requests-detail__tag">{urgency.label}</span>
										</div>
									</div>

									<div className="fixora-requests-detail__grid">
										<div className="fixora-requests-detail__card">
											<div className="fixora-requests-detail__card-label">Client</div>
											<div className="fixora-requests-detail__entity">
												<div className="fixora-requests-detail__avatar">C</div>
												<div>
													<div className="fixora-requests-detail__entity-name">{t('requests.customer')}</div>
													<div className="fixora-requests-detail__rating">
														<StarRounded style={{ fontSize: 15, color: '#F59E0B' }} />
														<span className="fixora-requests-detail__rating-val">Client</span>
														<span className="fixora-requests-detail__rating-sub">rating</span>
													</div>
												</div>
											</div>
											<div className="fixora-requests-detail__loc">
												<LocationOnOutlined style={{ fontSize: 15 }} />
												<span>Booking {reqCode(displayedBooking._id)}</span>
											</div>
										</div>
										<div className="fixora-requests-detail__card">
											<div className="fixora-requests-detail__card-label">Device</div>
											<div className="fixora-requests-detail__entity">
												<div className="fixora-requests-detail__device-icon">
													<DeviceGlyph type={displayedBooking.aiClassification?.deviceType} size={22} color="#FF9A3C" />
												</div>
												<div>
													<div className="fixora-requests-detail__entity-name">{deviceLabel(displayedBooking.aiClassification?.deviceType)}</div>
													<div className="fixora-requests-detail__warranty">
														<CheckCircleOutline style={{ fontSize: 14 }} />
														{issueLabel(displayedBooking.aiClassification?.issueCategory)}
													</div>
												</div>
											</div>
											<div className="fixora-requests-detail__chips">
												<span className="fixora-requests-detail__chip">
													<CameraAltOutlined style={{ fontSize: 13 }} /> 3 photos
												</span>
												<span className="fixora-requests-detail__chip fixora-requests-detail__chip--price">{priceLabel}</span>
											</div>
										</div>
									</div>

									<div className="fixora-requests-detail__description">
										<div className="fixora-requests-detail__card-label">{t('requests.issueDescription')}</div>
										<p>{displayedBooking.problemDescription || 'No description provided'}</p>
									</div>

									<div className="fixora-requests-detail__photos">
										<div className="fixora-requests-detail__card-label">Damage Photos (3)</div>
										<div className="fixora-requests-detail__photos-grid">
											{[1, 2, 3].map((n) => (
												<div key={n} className="fixora-requests-detail__photo">
													<PhotoCameraOutlined style={{ fontSize: 22 }} />
													<span>Photo {n}</span>
												</div>
											))}
										</div>
									</div>
								</div>

								<div className="fixora-requests-actionbar">
									<button
										className="fixora-requests-detail__btn fixora-requests-detail__btn--accept"
										disabled={accepting}
										onClick={() => handleAccept(displayedBooking._id)}
									>
										<CheckCircleOutline style={{ fontSize: 18 }} /> {t('requests.acceptQuote')}
									</button>
									<button
										className="fixora-requests-detail__btn fixora-requests-detail__btn--message"
										onClick={() => router.push('/technician/messages')}
									>
										<ChatBubbleOutlineOutlined style={{ fontSize: 17 }} /> {t('requests.messageClient')}
									</button>
									<button
										className="fixora-requests-detail__btn fixora-requests-detail__btn--decline"
										disabled={rejecting}
										onClick={() => handleDecline(displayedBooking._id)}
									>
										<HighlightOffOutlined style={{ fontSize: 17 }} /> {t('requests.decline')}
									</button>
								</div>
							</>
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
