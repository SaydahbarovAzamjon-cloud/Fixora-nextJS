import React from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

const Analytics: NextPage = () => {
	const ratingTrend = [
		{ month: 'Jan', rating: 4.2 },
		{ month: 'Feb', rating: 4.4 },
		{ month: 'Mar', rating: 4.6 },
		{ month: 'Apr', rating: 4.7 },
		{ month: 'May', rating: 4.8 },
		{ month: 'Jun', rating: 4.9 },
	];

	return (
		<div style={{ padding: '24px', height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
			{/* KPI Cards */}
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
				<div style={{
					background: '#111111',
					border: '1px solid rgba(255,255,255,0.07)',
					borderRadius: 14,
					padding: 20
				}}>
					<div style={{ color: '#606060', fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Total Jobs</div>
					<div style={{ color: '#FF6B00', fontSize: 32, fontWeight: 700, marginBottom: 4 }}>156</div>
					<div style={{ color: '#22C55E', fontSize: 12, fontWeight: 600 }}>↑ 12 this month</div>
				</div>

				<div style={{
					background: '#111111',
					border: '1px solid rgba(255,255,255,0.07)',
					borderRadius: 14,
					padding: 20
				}}>
					<div style={{ color: '#606060', fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Avg Rating</div>
					<div style={{ color: '#22C55E', fontSize: 32, fontWeight: 700, marginBottom: 4 }}>4.9</div>
					<div style={{ color: '#22C55E', fontSize: 12, fontWeight: 600 }}>⭐ Out of 5</div>
				</div>

				<div style={{
					background: '#111111',
					border: '1px solid rgba(255,255,255,0.07)',
					borderRadius: 14,
					padding: 20
				}}>
					<div style={{ color: '#606060', fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Response Time</div>
					<div style={{ color: '#6366F1', fontSize: 32, fontWeight: 700, marginBottom: 4 }}>4.2h</div>
					<div style={{ color: '#6366F1', fontSize: 12, fontWeight: 600 }}>Average response</div>
				</div>
			</div>

			{/* Chart */}
			<div style={{
				background: '#111111',
				border: '1px solid rgba(255,255,255,0.07)',
				borderRadius: 14,
				padding: 20
			}}>
				<h3 style={{ color: '#F0F0F0', fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Rating Trend</h3>
				<ResponsiveContainer width="100%" height={300}>
					<LineChart data={ratingTrend}>
						<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
						<XAxis dataKey="month" stroke="#606060" />
						<YAxis stroke="#606060" domain={[4, 5]} />
						<Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
						<Line type="monotone" dataKey="rating" stroke="#FF6B00" strokeWidth={2} dot={{ fill: '#FF6B00' }} />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default withTechnicianLayout(Analytics);
