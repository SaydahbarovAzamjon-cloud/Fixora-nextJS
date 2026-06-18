import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
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
import { formatKrw } from '../../../libs/utils/formatCurrency';
import { GET_TECHNICIAN_BOOKINGS } from '../../../apollo/user/profile';
import { userVar } from '../../../apollo/store';
import {
	JOB_STAGE_INFO,
	getJobStage,
	getJobProgress,
	buildTimeline,
	deviceLabel,
	formatDue,
	formatDateTime,
} from '../../../libs/components/technician/ActiveJobs/jobHelpers';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

const DeviceGlyph = ({ type, size = 18, color = '#9A9A9A' }: { type?: string | null; size?: number; color?: string }) => {
	const sx = { fontSize: size, color } as const;
	switch (type) {
		case 'IPHONE': return <SmartphoneOutlined style={sx} />;
		case 'IPAD': return <TabletMacOutlined style={sx} />;
		case 'MACBOOK': return <LaptopMacOutlined style={sx} />;
		case 'APPLE_WATCH': return <WatchOutlined style={sx} />;
		default: return <BuildOutlined style={sx} />;
	}
};

const jobCode = (id: string) => `JOB-${id.slice(-3).toUpperCase()}`;

const fmtDate = (dateStr?: string | null) => {
	if (!dateStr) return 'TBD';
	return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const FILTERS = [
	{ id: 'all', label: 'All Jobs' },
	{ id: 'DIAGNOSING', label: 'Diagnosing' },
	{ id: 'IN_PROGRESS', label: 'In Progress' },
	{ id: 'PARTS_ORDERED', label: 'Parts Ordered' },
	{ id: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
];

const ActiveJobs: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [selectedJob, setSelectedJob] = useState<any>(null);
	const [activeFilter, setActiveFilter] = useState<string>('all');

	const searchTerm = ((router.query.search as string) ?? '').trim().toLowerCase();

	const { data: bookingsData } = useQuery(GET_TECHNICIAN_BOOKINGS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 100, search: {} } },
		fetchPolicy: 'network-only',
	});

	const activeJobs = useMemo(
		() =>
			(bookingsData?.getTechnicianBookings?.list ?? []).filter((b: any) =>
				['ACCEPTED', 'IN_PROGRESS'].includes(b?.bookingStatus)
			),
		[bookingsData]
	);

	const counts = useMemo(() => {
		const c: Record<string, number> = { all: activeJobs.length, DIAGNOSING: 0, IN_PROGRESS: 0, PARTS_ORDERED: 0, READY_FOR_PICKUP: 0 };
		activeJobs.forEach((j: any) => {
			const stage = getJobStage(j);
			c[stage] = (c[stage] || 0) + 1;
		});
		return c;
	}, [activeJobs]);

	const filtered = useMemo(() => {
		let result = activeFilter === 'all' ? activeJobs : activeJobs.filter((j: any) => getJobStage(j) === activeFilter);
		if (searchTerm) {
			result = result.filter((j: any) => {
				const customer = (j.customerData?.userFullName || j.customerData?.userNickname || '').toLowerCase();
				const title = (j.problemTitle || '').toLowerCase();
				const dev = deviceLabel(j.aiClassification?.deviceType).toLowerCase();
				return customer.includes(searchTerm) || title.includes(searchTerm) || dev.includes(searchTerm);
			});
		}
		return result;
	}, [activeJobs, activeFilter, searchTerm]);

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
							const stage = getJobStage(job);
							const info = JOB_STAGE_INFO[stage];
							const progress = getJobProgress(job);
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
											<div className="fixora-job-card__name">{job.customerData?.userFullName || job.customerData?.userNickname || 'Unknown'}</div>
											<div className="fixora-job-card__device">{deviceLabel(job.aiClassification?.deviceType)}</div>
										</div>
										<span className="fixora-job-card__status" style={{ color: info.color, background: info.bg }}>
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
											{formatKrw(parseFloat(job.finalPrice || job.estimatedPrice || '0'))}
										</span>
										<span className="fixora-job-card__due">
											<AccessTimeOutlined style={{ fontSize: 13 }} />
											{formatDue(job.bookingDate)}
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
						const stage = getJobStage(displayedJob);
						const info = JOB_STAGE_INFO[stage];
						const timeline = buildTimeline(displayedJob);
						const price = parseFloat(displayedJob.finalPrice || displayedJob.estimatedPrice || '0');
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
												<div className="fixora-jobs-infocard__value">{displayedJob.customerData?.userFullName || displayedJob.customerData?.userNickname || 'Unknown'}</div>
												<div className="fixora-jobs-infocard__sub">Verified Customer</div>
											</div>
										</div>
										<div className="fixora-jobs-infocard">
											<div className="fixora-jobs-infocard__icon">
												<AttachMoneyOutlined style={{ fontSize: 18, color: '#22C55E' }} />
											</div>
											<div>
												<div className="fixora-jobs-infocard__label">Price</div>
												<div className="fixora-jobs-infocard__value fixora-jobs-infocard__value--price">{formatKrw(price)}</div>
												<div className="fixora-jobs-infocard__sub">Pending payment</div>
											</div>
										</div>
										<div className="fixora-jobs-infocard">
											<div className="fixora-jobs-infocard__icon">
												<CalendarTodayOutlined style={{ fontSize: 17, color: '#F59E0B' }} />
											</div>
											<div>
												<div className="fixora-jobs-infocard__label">Due Date</div>
												<div className="fixora-jobs-infocard__value">{formatDue(displayedJob.bookingDate)}</div>
												<div className="fixora-jobs-infocard__sub">Estimated completion</div>
											</div>
										</div>
									</div>

									<div className="fixora-jobs-timeline-card">
										<h3 className="fixora-jobs-timeline-card__title">Repair Timeline</h3>
										<div className="fixora-jobs-timeline">
											{timeline.map(({ label, done, timestamp }, idx) => {
												const current = !done && (idx === 0 || timeline[idx - 1]?.done);
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
															{idx < timeline.length - 1 && (
																<div className={`fixora-jobs-tl-step__line ${done ? 'fixora-jobs-tl-step__line--done' : ''}`} />
															)}
														</div>
														<div className="fixora-jobs-tl-step__content">
															<div className="fixora-jobs-tl-step__label">{label}</div>
															{reached && timestamp && (
																<div className="fixora-jobs-tl-step__time">{formatDateTime(timestamp)}</div>
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
