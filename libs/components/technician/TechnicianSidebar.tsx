import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface NavItem {
	id: string;
	icon: string;
	label: string;
	route: string;
	badge?: number;
}

const TechnicianSidebar: React.FC = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [isOnline, setIsOnline] = useState(true);

	const navItems: NavItem[] = [
		{ id: 'dashboard', icon: '📊', label: 'Dashboard', route: '/technician/dashboard' },
		{ id: 'requests', icon: '📬', label: 'Incoming Requests', route: '/technician/requests', badge: 4 },
		{ id: 'jobs', icon: '💼', label: 'Active Jobs', route: '/technician/jobs', badge: 7 },
		{ id: 'messages', icon: '💬', label: 'Messages', route: '/technician/messages', badge: 2 },
		{ id: 'notifications', icon: '🔔', label: 'Notifications', route: '/technician/notifications', badge: 9 },
		{ id: 'profile', icon: '👤', label: 'Public Profile', route: '/technician/profile' },
		{ id: 'analytics', icon: '📈', label: 'Analytics', route: '/technician/analytics' },
		{ id: 'earnings', icon: '💰', label: 'Earnings', route: '/technician/earnings' },
	];

	const isActive = (route: string) => router.pathname === route;

	const handleLogout = () => {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		router.push('/login');
	};

	return (
		<aside className="fixora-technician-sidebar">
			{/* Logo */}
			<div className="fixora-technician-sidebar__logo">
				<div className="fixora-logo-icon">⚡</div>
				<div>
					<div className="fixora-logo-text">FIXORA</div>
					<div className="fixora-logo-subtext">TECHNICIAN</div>
				</div>
			</div>

			{/* Status Badge */}
			<div style={{
				padding: '12px 16px',
				borderBottom: '1px solid rgba(255,255,255,0.04)',
				display: 'flex',
				alignItems: 'center',
				gap: 8,
				background: 'rgba(34,197,94,0.08)',
				margin: '0 10px 4px',
				borderRadius: 8,
				border: '1px solid rgba(34,197,94,0.2)',
			}}>
				<div style={{
					width: 7,
					height: 7,
					borderRadius: '50%',
					background: '#22C55E',
					boxShadow: '0 0 6px #22C55E',
				}} />
				<span style={{
					color: '#22C55E',
					fontSize: '11px',
					fontWeight: 600,
				}}>Available for Jobs</span>
			</div>

			{/* Navigation */}
			<nav className="fixora-technician-sidebar__nav">
				<div style={{
					color: '#404040',
					fontSize: '10px',
					fontWeight: 600,
					letterSpacing: '0.1em',
					padding: '6px 10px',
					marginBottom: 2,
				}}>MAIN MENU</div>
				{navItems.map((item) => (
					<button
						key={item.id}
						className={`fixora-technician-sidebar__nav-item ${isActive(item.route) ? 'fixora-technician-sidebar__nav-item--active' : ''}`}
						onClick={() => router.push(item.route)}
						type="button"
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 10,
							width: '100%',
							padding: '8px 10px',
							borderRadius: 9,
							background: isActive(item.route) ? 'rgba(255,107,0,0.14)' : 'transparent',
							border: 'none',
							cursor: 'pointer',
							color: isActive(item.route) ? '#FF6B00' : '#808080',
							fontSize: 13,
							fontWeight: isActive(item.route) ? 600 : 400,
							transition: 'all 0.15s ease',
							position: 'relative',
							marginBottom: 1,
						}}
						onMouseEnter={(e) => {
							if (!isActive(item.route)) {
								(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
								(e.currentTarget as HTMLButtonElement).style.color = '#D0D0D0';
							}
						}}
						onMouseLeave={(e) => {
							if (!isActive(item.route)) {
								(e.currentTarget as HTMLButtonElement).style.background = 'transparent';
								(e.currentTarget as HTMLButtonElement).style.color = '#808080';
							}
						}}
					>
						<span style={{ fontSize: 16 }}>{item.icon}</span>
						<span style={{ flex: 1, textAlign: 'left', lineHeight: 1 }}>{item.label}</span>
						{item.badge && isActive(item.route) && (
							<span style={{
								background: '#FF6B00',
								color: '#fff',
								borderRadius: 20,
								fontSize: '10px',
								fontWeight: 700,
								padding: '1px 6px',
								lineHeight: '16px',
							}}>{item.badge}</span>
						)}
						{item.badge && !isActive(item.route) && (
							<span style={{
								background: '#2A2A2A',
								color: '#A0A0A0',
								borderRadius: 20,
								fontSize: '10px',
								fontWeight: 700,
								padding: '1px 6px',
								lineHeight: '16px',
							}}>{item.badge}</span>
						)}
					</button>
				))}
			</nav>

			{/* Footer */}
			<div className="fixora-technician-sidebar__footer">
				<div className="fixora-technician-sidebar__online-status">
					<div className="fixora-technician-sidebar__status-info">
						<div className="fixora-technician-sidebar__status-dot" style={{ opacity: isOnline ? 1 : 0.5 }} />
						<span className="fixora-technician-sidebar__status-text">
							{isOnline ? 'Available for Jobs' : 'You are offline'}
						</span>
					</div>
				</div>

				{/* Technician Card */}
				<div style={{
					marginTop: 10,
					padding: '10px',
					borderRadius: 10,
					background: 'rgba(255,255,255,0.04)',
					border: '1px solid rgba(255,255,255,0.07)',
					display: 'flex',
					alignItems: 'center',
					gap: 10,
					cursor: 'pointer',
				}}>
					<div style={{
						width: 32,
						height: 32,
						borderRadius: '50%',
						background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
						fontSize: 13,
						fontWeight: 700,
						color: '#fff',
					}}>{user?.userNickname?.[0] || 'A'}{user?.userNickname?.[1] || 'K'}</div>
					<div style={{ flex: 1, minWidth: 0 }}>
						<div style={{
							color: '#E0E0E0',
							fontSize: 12,
							fontWeight: 600,
							lineHeight: 1.2,
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						}}>{user?.userNickname || 'Alex Kim'}</div>
						<div style={{ color: '#606060', fontSize: 11, marginTop: 1 }}>Pro Technician</div>
					</div>
					<span style={{ color: '#606060', fontSize: 11 }}>›</span>
				</div>

				<button
					className="fixora-technician-sidebar__logout"
					onClick={handleLogout}
					type="button"
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 8,
						width: '100%',
						padding: '8px 10px',
						marginTop: 10,
						border: 'none',
						background: 'transparent',
						color: '#808080',
						borderRadius: 9,
						cursor: 'pointer',
						fontSize: 13,
						fontWeight: 400,
						transition: 'all 0.15s ease',
					}}
					onMouseEnter={(e) => {
						(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
						(e.currentTarget as HTMLButtonElement).style.color = '#D0D0D0';
					}}
					onMouseLeave={(e) => {
						(e.currentTarget as HTMLButtonElement).style.background = 'transparent';
						(e.currentTarget as HTMLButtonElement).style.color = '#808080';
					}}
				>
					🚪 Logout
				</button>
			</div>
		</aside>
	);
};

export default TechnicianSidebar;
