import React, { useMemo } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery, useReactiveVar } from '@apollo/client';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { GET_MY_BOOKINGS } from '../../../apollo/user/profile';
import { userVar } from '../../../apollo/store';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

const Earnings: NextPage = () => {
	const user = useReactiveVar(userVar);
	const { data: bookingsData } = useQuery(GET_MY_BOOKINGS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 100, search: {} } },
		fetchPolicy: 'network-only',
	});

	const completedJobs = useMemo(() =>
		(bookingsData?.getMyBookings?.list ?? []).filter((b: any) => b?.bookingStatus === 'COMPLETED'),
		[bookingsData]
	);

	const totalEarnings = useMemo(() => {
		return completedJobs
			.reduce((sum: number, b: any) => sum + (parseFloat(b?.finalPrice) || 0), 0)
			.toFixed(2);
	}, [completedJobs]);

	const monthlyEarnings = useMemo(() => {
		const lastMonth = new Date();
		lastMonth.setMonth(lastMonth.getMonth() - 1);
		return completedJobs
			.filter((b: any) => new Date(b?.completedAt || new Date()) > lastMonth)
			.reduce((sum: number, b: any) => sum + (parseFloat(b?.finalPrice) || 0), 0);
	}, [completedJobs]);

	const earningsChart = [
		{ week: 'Week 1', earnings: 450 },
		{ week: 'Week 2', earnings: 680 },
		{ week: 'Week 3', earnings: 520 },
		{ week: 'Week 4', earnings: 890 },
	];

	const dailyChart = [
		{ day: 'Mon', jobs: 3, earnings: 320 },
		{ day: 'Tue', jobs: 5, earnings: 480 },
		{ day: 'Wed', jobs: 2, earnings: 240 },
		{ day: 'Thu', jobs: 6, earnings: 620 },
		{ day: 'Fri', jobs: 8, earnings: 780 },
		{ day: 'Sat', jobs: 5, earnings: 540 },
		{ day: 'Sun', jobs: 2, earnings: 160 },
	];

	const transactions = [
		{ id: 1, customer: 'Sarah Johnson', service: 'iPhone Screen Replacement', amount: 85, date: '2 hours ago' },
		{ id: 2, customer: 'Michael Chen', service: 'Battery Replacement', amount: 65, date: '5 hours ago' },
		{ id: 3, customer: 'Emma Williams', service: 'Water Damage Repair', amount: 150, date: 'Yesterday' },
		{ id: 4, customer: 'James Smith', service: 'Charging Port Repair', amount: 75, date: '2 days ago' },
		{ id: 5, customer: 'Lisa Anderson', service: 'Full Device Restoration', amount: 200, date: '3 days ago' },
	];

	return (
		<div style={{ padding: '24px', overflowY: 'auto', height: 'calc(100vh - 60px)' }}>
			{/* Header Stats */}
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
				<div style={{
					background: 'linear-gradient(135deg, rgba(255,107,0,0.15), rgba(255,154,60,0.1))',
					border: '1px solid rgba(255,107,0,0.25)',
					borderRadius: 14,
					padding: 20
				}}>
					<div style={{ color: '#606060', fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Total Earnings</div>
					<div style={{ color: '#FF6B00', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>${totalEarnings}</div>
					<div style={{ color: '#22C55E', fontSize: 12, fontWeight: 600 }}>↑ All time</div>
				</div>

				<div style={{
					background: 'rgba(34,197,94,0.08)',
					border: '1px solid rgba(34,197,94,0.2)',
					borderRadius: 14,
					padding: 20
				}}>
					<div style={{ color: '#606060', fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>This Month</div>
					<div style={{ color: '#22C55E', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>${monthlyEarnings.toFixed(2)}</div>
					<div style={{ color: '#22C55E', fontSize: 12, fontWeight: 600 }}>✓ 24 jobs completed</div>
				</div>

				<div style={{
					background: 'rgba(99,102,241,0.08)',
					border: '1px solid rgba(99,102,241,0.2)',
					borderRadius: 14,
					padding: 20
				}}>
					<div style={{ color: '#606060', fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Avg per Job</div>
					<div style={{ color: '#6366F1', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>${(parseFloat(totalEarnings) / Math.max(completedJobs.length, 1)).toFixed(2)}</div>
					<div style={{ color: '#6366F1', fontSize: 12, fontWeight: 600 }}>Across {completedJobs.length} jobs</div>
				</div>
			</div>

			{/* Charts Section */}
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
				{/* Weekly Earnings */}
				<div style={{
					background: '#111111',
					border: '1px solid rgba(255,255,255,0.07)',
					borderRadius: 14,
					padding: 20
				}}>
					<h3 style={{ color: '#F0F0F0', fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Weekly Earnings</h3>
					<ResponsiveContainer width="100%" height={280}>
						<AreaChart data={earningsChart}>
							<defs>
								<linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
									<stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
							<XAxis dataKey="week" stroke="#606060" />
							<YAxis stroke="#606060" />
							<Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
							<Area type="monotone" dataKey="earnings" stroke="#FF6B00" fillOpacity={1} fill="url(#colorEarnings)" />
						</AreaChart>
					</ResponsiveContainer>
				</div>

				{/* Daily Jobs & Earnings */}
				<div style={{
					background: '#111111',
					border: '1px solid rgba(255,255,255,0.07)',
					borderRadius: 14,
					padding: 20
				}}>
					<h3 style={{ color: '#F0F0F0', fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Daily Breakdown</h3>
					<ResponsiveContainer width="100%" height={280}>
						<BarChart data={dailyChart}>
							<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
							<XAxis dataKey="day" stroke="#606060" />
							<YAxis stroke="#606060" />
							<Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
							<Bar dataKey="earnings" fill="#FF6B00" radius={[4, 4, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Recent Transactions */}
			<div style={{
				background: '#111111',
				border: '1px solid rgba(255,255,255,0.07)',
				borderRadius: 14,
				padding: 20
			}}>
				<h3 style={{ color: '#F0F0F0', fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Recent Transactions</h3>
				<div style={{ overflowX: 'auto' }}>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<thead>
							<tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
								<th style={{ textAlign: 'left', padding: '12px', color: '#606060', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Customer</th>
								<th style={{ textAlign: 'left', padding: '12px', color: '#606060', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Service</th>
								<th style={{ textAlign: 'right', padding: '12px', color: '#606060', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Amount</th>
								<th style={{ textAlign: 'right', padding: '12px', color: '#606060', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Date</th>
							</tr>
						</thead>
						<tbody>
							{transactions.map((tx) => (
								<tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
									<td style={{ padding: '14px 12px', color: '#E0E0E0', fontSize: 13, fontWeight: 500 }}>{tx.customer}</td>
									<td style={{ padding: '14px 12px', color: '#A0A0A0', fontSize: 12 }}>{tx.service}</td>
									<td style={{ padding: '14px 12px', color: '#FF6B00', fontSize: 13, fontWeight: 700, textAlign: 'right' }}>${tx.amount}</td>
									<td style={{ padding: '14px 12px', color: '#606060', fontSize: 12, textAlign: 'right' }}>{tx.date}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default withTechnicianLayout(Earnings);


