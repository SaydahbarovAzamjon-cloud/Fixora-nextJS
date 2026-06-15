import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

const Settings: NextPage = () => {
	const settings = [
		{ group: 'Account', items: [{ icon: '👤', label: 'Profile Information', desc: 'Update your name and photo' }] },
		{ group: 'Work', items: [
			{ icon: '📍', label: 'Service Area', desc: 'Set your coverage area' },
			{ icon: '⏰', label: 'Work Hours', desc: 'Configure your availability' },
		]},
		{ group: 'Notifications', items: [
			{ icon: '🔔', label: 'Push Notifications', desc: 'Manage alerts and reminders' },
			{ icon: '💬', label: 'Messages', desc: 'New message notifications' },
		]},
		{ group: 'Billing', items: [
			{ icon: '💳', label: 'Payment Method', desc: 'Update payment details' },
			{ icon: '📊', label: 'Payout Settings', desc: 'Configure bank account' },
		]},
	];

	return (
		<div style={{ padding: '24px', maxWidth: 640, margin: '0 auto', height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
			{settings.map((section) => (
				<div key={section.group} style={{ marginBottom: 24 }}>
					<h3 style={{ color: '#606060', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>
						{section.group}
					</h3>
					{section.items.map((item, idx) => (
						<button key={idx} style={{
							width: '100%',
							background: '#111111',
							border: '1px solid rgba(255,255,255,0.07)',
							borderRadius: 12,
							padding: 16,
							display: 'flex',
							alignItems: 'center',
							gap: 12,
							cursor: 'pointer',
							marginBottom: 8,
							transition: 'all 0.15s ease'
						}}
						onMouseEnter={(e) => {
							(e.currentTarget as HTMLButtonElement).style.background = '#1A1A1A';
							(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)';
						}}
						onMouseLeave={(e) => {
							(e.currentTarget as HTMLButtonElement).style.background = '#111111';
							(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)';
						}}
						>
							<span style={{ fontSize: 20 }}>{item.icon}</span>
							<div style={{ flex: 1, textAlign: 'left' }}>
								<div style={{ color: '#E0E0E0', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
								<div style={{ color: '#606060', fontSize: 12 }}>{item.desc}</div>
							</div>
							<span style={{ color: '#606060', fontSize: 16 }}>›</span>
						</button>
					))}
				</div>
			))}

			{/* Logout */}
			<button style={{
				width: '100%',
				padding: '14px',
				marginTop: 24,
				background: 'rgba(239,68,68,0.1)',
				border: '1px solid rgba(239,68,68,0.2)',
				color: '#EF4444',
				borderRadius: 12,
				fontWeight: 600,
				cursor: 'pointer',
				fontSize: 13,
				transition: 'all 0.15s ease'
			}}>
				🚪 Sign Out
			</button>
		</div>
	);
};

export default withTechnicianLayout(Settings);
