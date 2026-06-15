import React, { useState } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

const Notifications: NextPage = () => {
	const notifications = [
		{ id: 1, type: 'request', title: 'New repair request', desc: 'Sarah Johnson submitted a screen repair request', icon: '📱', time: '2 min ago', unread: true },
		{ id: 2, type: 'payment', title: 'Payment received', desc: '$85.00 from iPhone screen repair completed', icon: '💰', time: '1 hour ago', unread: true },
		{ id: 3, type: 'rating', title: 'New 5-star rating', desc: 'Michael Chen left a 5-star review', icon: '⭐', time: '3 hours ago', unread: false },
		{ id: 4, type: 'message', title: 'New message', desc: 'Emma Williams: "Is my phone ready?"', icon: '💬', time: '5 hours ago', unread: false },
		{ id: 5, type: 'reminder', title: 'Job reminder', desc: 'James Smith\'s repair is due tomorrow', icon: '⏰', time: '1 day ago', unread: false },
	];

	return (
		<div style={{ padding: '24px', maxWidth: 720, margin: '0 auto', height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
				<h2 style={{ color: '#F0F0F0', fontSize: 18, fontWeight: 700, margin: 0 }}>Notifications</h2>
				<button style={{
					padding: '6px 12px',
					borderRadius: 8,
					background: 'transparent',
					border: '1px solid rgba(255,255,255,0.1)',
					color: '#E0E0E0',
					cursor: 'pointer',
					fontSize: 12,
					fontWeight: 600
				}}>
					Mark all as read
				</button>
			</div>

			{notifications.map((notif) => (
				<div key={notif.id} style={{
					background: notif.unread ? 'rgba(255,107,0,0.08)' : 'transparent',
					border: notif.unread ? '1px solid rgba(255,107,0,0.2)' : '1px solid rgba(255,255,255,0.05)',
					borderRadius: 12,
					padding: 16,
					marginBottom: 12,
					display: 'flex',
					gap: 12,
					cursor: 'pointer',
					transition: 'all 0.15s ease'
				}}>
					<div style({ fontSize: 20 }}>{notif.icon}</div>
					<div style={{ flex: 1 }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 4 }}>
							<div style={{ color: '#E0E0E0', fontSize: 13, fontWeight: 600 }}>{notif.title}</div>
							<div style={{ color: '#606060', fontSize: 11 }}>{notif.time}</div>
						</div>
						<div style={{ color: '#A0A0A0', fontSize: 12 }}>{notif.desc}</div>
					</div>
					{notif.unread && (
						<div style={{
							width: 8,
							height: 8,
							borderRadius: '50%',
							background: '#FF6B00',
							flexShrink: 0,
							marginTop: 2
						}} />
					)}
				</div>
			))}
		</div>
	);
};

export default withTechnicianLayout(Notifications);
