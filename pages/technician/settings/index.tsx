import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { technicianPageProps } from '../../../libs/i18n/technicianPageProps';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: await technicianPageProps(locale),
});

const Settings: NextPage = () => {
	const { t } = useTranslation('technician');

	const settings = [
		{
			group: t('settings.groupAccount'),
			items: [{ icon: '👤', label: t('settings.profileInfo'), desc: t('settings.profileInfoDesc') }],
		},
		{
			group: t('settings.groupWork'),
			items: [
				{ icon: '📍', label: t('settings.serviceArea'), desc: t('settings.serviceAreaDesc') },
				{ icon: '⏰', label: t('settings.workHours'), desc: t('settings.workHoursDesc') },
			],
		},
		{
			group: t('settings.groupNotifications'),
			items: [
				{ icon: '🔔', label: t('settings.pushNotifications'), desc: t('settings.pushNotificationsDesc') },
				{ icon: '💬', label: t('settings.messages'), desc: t('settings.messagesDesc') },
			],
		},
		{
			group: t('settings.groupBilling'),
			items: [
				{ icon: '💳', label: t('settings.paymentMethod'), desc: t('settings.paymentMethodDesc') },
				{ icon: '📊', label: t('settings.payoutSettings'), desc: t('settings.payoutSettingsDesc') },
			],
		},
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
							transition: 'all 0.15s ease',
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
				transition: 'all 0.15s ease',
			}}>
				{t('settings.signOut')}
			</button>
		</div>
	);
};

export default withTechnicianLayout(Settings);
