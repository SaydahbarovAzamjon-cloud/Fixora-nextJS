import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

const TechnicianSidebar: React.FC = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [isOnline, setIsOnline] = useState(true);

	const navItems = [
		{ id: 'dashboard', label: 'Dashboard', route: '/technician/dashboard', icon: '📊' },
		{ id: 'requests', label: 'Incoming Requests', route: '/technician/requests', icon: '📬', badge: 4 },
		{ id: 'jobs', label: 'Active Jobs', route: '/technician/jobs', icon: '💼', badge: 7 },
		{ id: 'messages', label: 'Messages', route: '/technician/messages', icon: '💬', badge: 2 },
		{ id: 'notifications', label: 'Notifications', route: '/technician/notifications', icon: '🔔', badge: 9 },
		{ id: 'profile', label: 'Public Profile', route: '/technician/profile', icon: '👤' },
		{ id: 'analytics', label: 'Analytics', route: '/technician/analytics', icon: '📈' },
		{ id: 'earnings', label: 'Earnings', route: '/technician/earnings', icon: '💰' },
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
					>
						<span className="fixora-technician-sidebar__nav-icon">{item.icon}</span>
						<span className="fixora-technician-sidebar__nav-label">{item.label}</span>
						{item.badge && (
							<span style={{
								background: isActive(item.route) ? '#FF6B00' : '#2A2A2A',
								color: isActive(item.route) ? '#fff' : '#A0A0A0',
								borderRadius: 20,
								fontSize: '10px',
								fontWeight: 700,
								padding: '1px 6px',
								lineHeight: '16px',
								marginLeft: 'auto',
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
					}}>AK</div>
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

				<button className="fixora-technician-sidebar__logout" onClick={handleLogout} type="button">
					🚪 Logout
				</button>
			</div>
		</aside>
	);
};

export default TechnicianSidebar;
