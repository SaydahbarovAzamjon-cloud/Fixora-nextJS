import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery, useReactiveVar } from '@apollo/client';
import SmartphoneOutlined from '@mui/icons-material/SmartphoneOutlined';
import TabletMacOutlined from '@mui/icons-material/TabletMacOutlined';
import LaptopMacOutlined from '@mui/icons-material/LaptopMacOutlined';
import WatchOutlined from '@mui/icons-material/WatchOutlined';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import RadioButtonChecked from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import EastOutlined from '@mui/icons-material/EastOutlined';
import MoreHorizOutlined from '@mui/icons-material/MoreHorizOutlined';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { GET_MY_BOOKINGS } from '../../../apollo/user/profile';
import { userVar } from '../../../apollo/store';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

const DEVICE_LABEL: Record<string, string> = {
	IPHONE: 'iPhone',
	APPLE_WATCH: 'Apple Watch',
	IPAD: 'iPad',
	MACBOOK: 'MacBook',
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
const jobCode = (id: string) => `JOB-${id.slice(-3).toUpperCase()}`;

// Visual stage derived from booking status (granular sub-status not stored in schema).
const jobStage = (job: any): string => {
	if (job?.bookingStatus === 'IN_PROGRESS') return 'inprogress';
	return 'diagnosing';
};

const STAGE_INFO: Record<string, { label: string; color: string; bg: string }> = {
	diagnosing: { label: 'Diagnosing', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
	inprogress: { label: 'In Progress', color: '#FF6B00', bg: 'rgba(255,107,0,0.12)' },
	parts: { label: 'Parts Ordered', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
	ready: { label: 'Ready for Pickup', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
};

const STAGE_PROGRESS: Record<string, number> = { diagnosing: 30, inprogress: 65, parts: 45, ready: 100 };
// timeline index that is currently active per stage
const STAGE_STEP: Record<string, number> = { diagnosing: 1, inprogress: 3, parts: 2, ready: 5 };

const TIMELINE = ['Received & Logged', 'Initial Diagnosis', 'Parts Ordered', 'Repair In Progress', 'Quality Testing', 'Ready for Pickup'];

const FILTERS = [
	{ id: 'all', label: 'All Jobs' },
	{ id: 'diagnosing', label: 'Diagnosing' },
	{ id: 'inprogress', label: 'In Progress' },
	{ id: 'parts', label: 'Parts Ordered' },
	{ id: 'ready', label: 'Ready for Pickup' },
];

const fmtDate = (dateStr?: string | null) => {
	if (!dateStr) return 'TBD';
	return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const fmtDue = (dateStr?: string | null) => {
	if (!dateStr) return 'TBD';
	const d = new Date(dateStr);
	return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
};

const stepTime = (createdAt: string | undefined, idx: number) => {
	if (!createdAt) return '';
	const d = new Date(createdAt);
	d.setHours(d.getHours() + idx * 5);
	return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
};

const ActiveJobs: NextPage = () => {
	const user = useReactiveVar(userVar);
	const [selectedJob, setSelectedJob] = useState<any>(null);
	const [activeFilter, setActiveFilter] = useState<string>('all');

	const { data: bookingsData } = useQuery(GET_MY_BOOKINGS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 100, search: {} } },
		fetchPolicy: 'network-only',
	});

	const activeJobs = useMemo(
		() =>
			(bookingsData?.getMyBookings?.list ?? []).filter((b: any) =>
				['ACCEPTED', 'IN_PROGRESS'].includes(b?.bookingStatus)
			),
		[bookingsData]
	);

	const counts = useMemo(() => {
		const c: Record<string, number> = { all: activeJobs.length, diagnosing: 0, inprogress: 0, parts: 0, ready: 0 };
		activeJobs.forEach((j: any) => {
			c[jobStage(j)] = (c[jobStage(j)] || 0) + 1;
		});
		return c;
	}, [activeJobs]);

	const filtered = useMemo(
		() => (activeFilter === 'all' ? activeJobs : activeJobs.filter((j: any) => jobStage(j) === activeFilter)),
		[activeJobs, activeFilter]
	);

	const displayedJob = useMemo(
		() => (selectedJob && filtered.find((j: any) => j._id === selectedJob._id)) || filtered[0] || null,
		[filtered, selectedJob]
	);

	return (
		<div className="fixora-jobs-page">
			{/* Left Pane: Jobs List */}
			<div className="fixora-jobs-left">
				<div className="fixora-jobs-filterbar">
					{FILTERS.map((f) => (
						<button
							key={f.id}
							className={`fixora-jobs-filter ${activeFilter === f.id ? 'fixora-jobs-filter--active' : ''}`}
							onClick={() => setActiveFilter(f.id)}
						>
							{f.label}
							<span className="fixora-jobs-filter__count">{counts[f.id] ?? 0}</span>
						</button>
					))}
				</div>

				<div className="fixora-jobs-list">
					{filtered.length === 0 ? (
						<div className="fixora-jobs-empty">No active jobs</div>
					) : (
						filtered.map((job: any) => {
							const stage = jobStage(job);
							const info = STAGE_INFO[stage];
							const progress = STAGE_PROGRESS[stage];
							const active = displayedJob?._id === job._id;
							return (
								<div
									key={job._id}
									className={`fixora-job-card ${active ? 'fixora-job-card--active' : ''}`}
									onClick={() => setSelectedJob(job)}
								>
									<div className="fixora-job-card__top">
										<div className="fixora-job-card__icon">
											<DeviceGlyph type={job.aiClassification?.deviceType} />
										</div>
										<div className="fixora-job-card__head">
											<div className="fixora-job-card__name">{job.userId?.userNickname || 'Customer'}</div>
											<div className="fixora-job-card__device">{deviceLabel(job.aiClassification?.deviceType)}</div>
										</div>
										<span className="fixora-job-card__status" style={{ color: info.color }}>
											{info.label}
										</span>
									</div>

									<div className="fixora-job-card__title">{job.problemTitle}</div>

									<div className="fixora-job-card__progress">
										<div className="fixora-job-card__track">
											<div
												className={`fixora-job-card__bar ${progress >= 100 ? 'fixora-job-card__bar--done' : ''}`}
												style={{ width: `${progress}%` }}
											/>
										</div>
										<span className="fixora-job-card__pct" style={{ color: progress >= 100 ? '#22C55E' : '#FF9A3C' }}>
											{progress}%
										</span>
									</div>

									<div className="fixora-job-card__bottom">
										<span className="fixora-job-card__price">
											${parseFloat(job.finalPrice || job.estimatedPrice || '0').toFixed(0)}
										</span>
										<span className="fixora-job-card__due">
											<AccessTimeOutlined style={{ fontSize: 13 }} />
											{fmtDue(job.bookingDate)}
										</span>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>

			{/* Right Pane: Job Details */}
			<div className="fixora-jobs-right">
				{displayedJob ? (
					(() => {
						const stage = jobStage(displayedJob);
						const info = STAGE_INFO[stage];
						const currentStep = STAGE_STEP[stage];
						const price = parseFloat(displayedJob.finalPrice || displayedJob.estimatedPrice || '0').toFixed(0);
						return (
							<>
								<div className="fixora-jobs-detail">
									<div className="fixora-jobs-detail__header">
										<div>
											<div className="fixora-jobs-detail__meta">
												{jobCode(displayedJob._id)} • Started {fmtDate(displayedJob.createdAt)}
											</div>
											<h2 className="fixora-jobs-detail__title">{displayedJob.problemTitle}</h2>
											<div className="fixora-jobs-detail__sub">{deviceLabel(displayedJob.aiClassification?.deviceType)}</div>
										</div>
										<span className="fixora-jobs-detail__status" style={{ color: info.color, background: info.bg }}>
											{info.label}
										</span>
									</div>

									<div className="fixora-jobs-detail__info">
										<div className="fixora-jobs-infocard">
											<div className="fixora-jobs-infocard__icon">
												<PersonOutlineOutlined style={{ fontSize: 18, color: '#3B82F6' }} />
											</div>
											<div>
												<div className="fixora-jobs-infocard__label">Client</div>
												<div className="fixora-jobs-infocard__value">{displayedJob.userId?.userNickname || 'Customer'}</div>
												<div className="fixora-jobs-infocard__sub">Verified Customer</div>
											</div>
										</div>
										<div className="fixora-jobs-infocard">
											<div className="fixora-jobs-infocard__icon">
												<AttachMoneyOutlined style={{ fontSize: 18, color: '#22C55E' }} />
											</div>
											<div>
												<div className="fixora-jobs-infocard__label">Price</div>
												<div className="fixora-jobs-infocard__value fixora-jobs-infocard__value--price">${price}</div>
												<div className="fixora-jobs-infocard__sub">Pending payment</div>
											</div>
										</div>
										<div className="fixora-jobs-infocard">
											<div className="fixora-jobs-infocard__icon">
												<CalendarTodayOutlined style={{ fontSize: 17, color: '#F59E0B' }} />
											</div>
											<div>
												<div className="fixora-jobs-infocard__label">Due Date</div>
												<div className="fixora-jobs-infocard__value">{fmtDue(displayedJob.bookingDate)}</div>
												<div className="fixora-jobs-infocard__sub">Estimated completion</div>
											</div>
										</div>
									</div>

									<div className="fixora-jobs-timeline-card">
										<h3 className="fixora-jobs-timeline-card__title">Repair Timeline</h3>
										<div className="fixora-jobs-timeline">
											{TIMELINE.map((label, idx) => {
												const done = idx < currentStep;
												const current = idx === currentStep;
												const reached = done || current;
												return (
													<div
														key={label}
														className={`fixora-jobs-tl-step ${reached ? 'fixora-jobs-tl-step--reached' : 'fixora-jobs-tl-step--pending'}`}
													>
														<div className="fixora-jobs-tl-step__rail">
															{reached ? (
																<RadioButtonChecked className="fixora-jobs-tl-step__node fixora-jobs-tl-step__node--reached" style={{ fontSize: 20 }} />
															) : (
																<RadioButtonUnchecked className="fixora-jobs-tl-step__node fixora-jobs-tl-step__node--pending" style={{ fontSize: 20 }} />
															)}
															{idx < TIMELINE.length - 1 && (
																<div className={`fixora-jobs-tl-step__line ${done ? 'fixora-jobs-tl-step__line--done' : ''}`} />
															)}
														</div>
														<div className="fixora-jobs-tl-step__content">
															<div className="fixora-jobs-tl-step__label">{label}</div>
															{reached && (
																<div className="fixora-jobs-tl-step__time">{stepTime(displayedJob.createdAt, idx)}</div>
															)}
														</div>
													</div>
												);
											})}
										</div>
									</div>
								</div>

								<div className="fixora-jobs-actionbar">
									<button className="fixora-jobs-btn fixora-jobs-btn--complete">
										<EastOutlined style={{ fontSize: 18 }} /> Mark Repair Complete
									</button>
									<button className="fixora-jobs-btn fixora-jobs-btn--more">
										<MoreHorizOutlined style={{ fontSize: 20 }} />
									</button>
								</div>
							</>
						);
					})()
				) : (
					<div className="fixora-jobs-detail__empty">No active jobs</div>
				)}
			</div>
		</div>
	);
};

export default withTechnicianLayout(ActiveJobs);
