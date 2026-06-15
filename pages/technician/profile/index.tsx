import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useReactiveVar } from '@apollo/client';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { userVar } from '../../../apollo/store';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

const PublicProfile: NextPage = () => {
	const user = useReactiveVar(userVar);

	return (
		<div style={{ padding: '24px', maxWidth: 640, margin: '0 auto', height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
			{/* Profile Header */}
			<div style={{
				background: 'linear-gradient(135deg, rgba(255,107,0,0.1), rgba(255,154,60,0.05))',
				border: '1px solid rgba(255,107,0,0.15)',
				borderRadius: 16,
				padding: 32,
				textAlign: 'center',
				marginBottom: 24
			}}>
				<div style={{
					width: 80,
					height: 80,
					borderRadius: '50%',
					background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: 32,
					fontWeight: 700,
					color: '#fff',
					margin: '0 auto 16px'
				}}>
					{user?.userNickname?.[0] || 'A'}
				</div>
				<h2 style={{ color: '#F0F0F0', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>{user?.userNickname || 'Technician'}</h2>
				<div style={{ color: '#FF6B00', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>⭐ Pro Technician</div>
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
					<div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12 }}>
						<div style={{ color: '#FF6B00', fontSize: 18, fontWeight: 700 }}>4.9</div>
						<div style={{ color: '#606060', fontSize: 11 }}>Rating</div>
					</div>
					<div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12 }}>
						<div style={{ color: '#22C55E', fontSize: 18, fontWeight: 700 }}>156</div>
						<div style={{ color: '#606060', fontSize: 11 }}>Jobs Done</div>
					</div>
					<div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12 }}>
						<div style={{ color: '#6366F1', fontSize: 18, fontWeight: 700 }}>98%</div>
						<div style={{ color: '#606060', fontSize: 11 }}>Success Rate</div>
					</div>
				</div>
			</div>

			{/* Bio Section */}
			<div style={{
				background: '#111111',
				border: '1px solid rgba(255,255,255,0.07)',
				borderRadius: 14,
				padding: 20,
				marginBottom: 16
			}}>
				<h3 style={{ color: '#F0F0F0', fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>About</h3>
				<p style={{ color: '#A0A0A0', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
					Expert technician with over 5 years of experience in smartphone and tablet repairs. Specialized in screen replacements, battery repairs, and water damage restoration.
				</p>
			</div>

			{/* Skills */}
			<div style={{
				background: '#111111',
				border: '1px solid rgba(255,255,255,0.07)',
				borderRadius: 14,
				padding: 20
			}}>
				<h3 style={{ color: '#F0F0F0', fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Skills & Services</h3>
				<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
					{['Screen Repair', 'Battery', 'Water Damage', 'Charging Port', 'Software', 'Back Glass'].map((skill) => (
						<span key={skill} style={{
							background: 'rgba(255,107,0,0.1)',
							border: '1px solid rgba(255,107,0,0.2)',
							color: '#FF6B00',
							padding: '6px 12px',
							borderRadius: 8,
							fontSize: 12,
							fontWeight: 600
						}}>
							{skill}
						</span>
					))}
				</div>
			</div>
		</div>
	);
};

export default withTechnicianLayout(PublicProfile);
