import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery, useReactiveVar } from '@apollo/client';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { GET_MY_BOOKINGS } from '../../../apollo/user/profile';
import { userVar } from '../../../apollo/store';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

const REPAIR_STEPS = [
	{ id: 1, label: 'Diagnostics', icon: '🔍' },
	{ id: 2, label: 'In Progress', icon: '🔧' },
	{ id: 3, label: 'Testing', icon: '✓' },
	{ id: 4, label: 'Ready for Pickup', icon: '📦' },
];

const ActiveJobs: NextPage = () => {
	const user = useReactiveVar(userVar);
	const [search, setSearch] = useState('');
	const [selectedJob, setSelectedJob] = useState<any>(null);

	const { data: bookingsData } = useQuery(GET_MY_BOOKINGS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 100, search: {} } },
		fetchPolicy: 'network-only',
	});

	const activeJobs = useMemo(() =>
		(bookingsData?.getMyBookings?.list ?? []).filter((b: any) =>
			['ACCEPTED', 'IN_PROGRESS'].includes(b?.bookingStatus)
		),
		[bookingsData]
	);

	const filtered = useMemo(() =>
		activeJobs.filter((b: any) =>
			(b.problemTitle || '').toLowerCase().includes(search.toLowerCase())
		),
		[activeJobs, search]
	);

	const displayedJob = selectedJob || filtered[0];
	const repairStep = displayedJob?.repairStep || 2;

	return (
		<div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
			{/* Left Pane: Jobs List */}
			<div style={{
				width: '360px',
				borderRight: '1px solid rgba(255,255,255,0.07)',
				display: 'flex',
				flexDirection: 'column',
				background: '#0D0D0D',
				padding: '16px'
			}}>
				<input
					type="text"
					placeholder="Search active jobs..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					style={{
						background: '#1A1A1A',
						border: '1px solid rgba(255,255,255,0.08)',
						borderRadius: '10px',
						padding: '9px 12px',
						color: '#E0E0E0',
						marginBottom: '12px',
						fontSize: '13px',
					}}
				/>

				<div style={{ flex: 1, overflowY: 'auto' }}>
					{filtered.length === 0 ? (
						<div style={{ color: '#606060', fontSize: '13px', padding: '20px 10px' }}>No active jobs</div>
					) : (
						filtered.map((job: any) => (
							<div
								key={job._id}
								onClick={() => setSelectedJob(job)}
								style={{
									padding: '14px',
									borderRadius: '11px',
									marginBottom: '8px',
									cursor: 'pointer',
									background: selectedJob?._id === job._id ? 'rgba(255,107,0,0.12)' : 'transparent',
									border: selectedJob?._id === job._id ? '1px solid rgba(255,107,0,0.3)' : '1px solid rgba(255,255,255,0.05)',
									transition: 'all 0.15s ease',
								}}
							>
								<div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
									<div style={{
										width: 36,
										height: 36,
										borderRadius: 10,
										background: '#1C1C1C',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: 16
									}}>
										🔧
									</div>
									<div style={{ flex: 1, minWidth: 0 }}>
										<div style={{ color: '#E0E0E0', fontSize: '12px', fontWeight: 600 }}>{job.userId?.userNickname || 'Customer'}</div>
										<div style={{ color: '#606060', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.problemTitle}</div>
									</div>
								</div>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<div style={{
										background: job.bookingStatus === 'IN_PROGRESS' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 107, 0, 0.1)',
										color: job.bookingStatus === 'IN_PROGRESS' ? '#22C55E' : '#FF6B00',
										padding: '4px 8px',
										borderRadius: '6px',
										fontSize: '11px',
										fontWeight: 600
									}}>
										{job.bookingStatus === 'IN_PROGRESS' ? '🟢 In Progress' : '⏳ Accepted'}
									</div>
									<span style={{ color: '#606060', fontSize: '12px' }}>Step {job.repairStep || 2}/4</span>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			{/* Right Pane: Job Details with Timeline */}
			<div style={{
				flex: 1,
				background: '#0A0A0A',
				padding: '24px',
				overflowY: 'auto'
			}}>
				{displayedJob ? (
					<div style={{ maxWidth: 680 }}>
						<h2 style={{ color: '#F0F0F0', fontSize: '18px', fontWeight: 700, margin: '0 0 20px' }}>{displayedJob.problemTitle}</h2>

						{/* Repair Timeline */}
						<div style={{
							background: '#111111',
							border: '1px solid rgba(255,255,255,0.07)',
							borderRadius: 14,
							padding: 24,
							marginBottom: 24
						}}>
							<div style={{ color: '#606060', fontSize: 11, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>REPAIR STATUS</div>

							<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
								{REPAIR_STEPS.map((step, idx) => (
									<React.Fragment key={step.id}>
										<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
											<div style={{
												width: 40,
												height: 40,
												borderRadius: '50%',
												background: step.id <= repairStep ? 'linear-gradient(135deg, #FF6B00, #FF9A3C)' : '#1A1A1A',
												border: `2px solid ${step.id <= repairStep ? '#FF6B00' : 'rgba(255,255,255,0.1)'}`,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												fontSize: 18,
												marginBottom: 8,
												transition: 'all 0.3s ease'
											}}>
												{step.icon}
											</div>
											<div style={{
												color: step.id === repairStep ? '#FF6B00' : step.id < repairStep ? '#22C55E' : '#606060',
												fontSize: 11,
												fontWeight: 600,
												textAlign: 'center'
											}}>
												{step.label}
											</div>
										</div>
										{idx < REPAIR_STEPS.length - 1 && (
											<div style={{
												height: 2,
												flex: 1,
												background: step.id < repairStep ? '#22C55E' : 'rgba(255,255,255,0.1)',
												marginBottom: 30,
												transition: 'all 0.3s ease'
											}} />
										)}
									</React.Fragment>
								))}
							</div>
						</div>

						{/* Job Info */}
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
							<div style={{
								background: '#111111',
								border: '1px solid rgba(255,255,255,0.07)',
								borderRadius: 14,
								padding: 18
							}}>
								<div style={{ color: '#606060', fontSize: 11, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>CUSTOMER</div>
								<div style={{ color: '#E0E0E0', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{displayedJob.userId?.userNickname || 'Customer'}</div>
								<div style={{ color: '#606060', fontSize: 12 }}>📱 iPhone</div>
							</div>
							<div style={{
								background: '#111111',
								border: '1px solid rgba(255,255,255,0.07)',
								borderRadius: 14,
								padding: 18
							}}>
								<div style={{ color: '#606060', fontSize: 11, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>PRICE</div>
								<div style={{ color: '#FF6B00', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>${parseFloat(displayedJob.finalPrice || displayedJob.estimatedPrice || '0').toFixed(2)}</div>
								<div style={{ color: '#606060', fontSize: 12 }}>Est. completion: 2 days</div>
							</div>
						</div>

						{/* Description */}
						<div style={{
							background: '#111111',
							border: '1px solid rgba(255,255,255,0.07)',
							borderRadius: 14,
							padding: 20,
							marginBottom: 20
						}}>
							<div style={{ color: '#606060', fontSize: 11, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>ISSUE</div>
							<p style={{ color: '#C0C0C0', margin: 0, fontSize: 14, lineHeight: 1.5 }}>{displayedJob.problemDescription}</p>
						</div>

						{/* Actions */}
						<div style={{ display: 'flex', gap: 12 }}>
							<button style={{
								flex: 1,
								padding: '14px',
								borderRadius: 12,
								background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
								border: 'none',
								color: '#fff',
								fontWeight: 700,
								cursor: 'pointer',
								fontSize: '13px',
								transition: 'all 0.2s ease'
							}}>
								📞 Contact Customer
							</button>
							<button style={{
								flex: 1,
								padding: '14px',
								borderRadius: 12,
								background: 'transparent',
								border: '1px solid rgba(255,255,255,0.1)',
								color: '#E0E0E0',
								fontWeight: 600,
								cursor: 'pointer',
								fontSize: '13px',
								transition: 'all 0.15s ease'
							}}>
								📝 Update Status
							</button>
						</div>
					</div>
				) : (
					<div style={{ color: '#606060', fontSize: '14px', padding: '20px' }}>No active jobs</div>
				)}
			</div>
		</div>
	);
};

export default withTechnicianLayout(ActiveJobs);


