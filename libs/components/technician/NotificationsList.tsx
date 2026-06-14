import React, { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';

interface Notification {
	id: string;
	type: 'request' | 'message' | 'review' | 'payment';
	title: string;
	description: string;
	timestamp: string;
	isRead: boolean;
	icon: string;
}

interface NotificationsListProps {
	notifications: Notification[];
	onMarkAsRead?: (id: string) => void;
	onMarkAllAsRead?: () => void;
	onDelete?: (id: string) => void;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
	notifications,
	onMarkAsRead,
	onMarkAllAsRead,
	onDelete,
}) => {
	const [hoveredId, setHoveredId] = useState<string | null>(null);

	const groupedNotifications = {
		today: notifications.filter((n) => n.timestamp.includes('Today')),
		earlier: notifications.filter((n) => !n.timestamp.includes('Today')),
	};

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'request':
				return 'fixora-notification--request';
			case 'message':
				return 'fixora-notification--message';
			case 'review':
				return 'fixora-notification--review';
			case 'payment':
				return 'fixora-notification--payment';
			default:
				return '';
		}
	};

	return (
		<div className="fixora-notifications-list">
			{/* Header */}
			<div className="fixora-notifications__header">
				<div>
					<h2 className="fixora-notifications__title">Notifications</h2>
					{unreadCount > 0 && (
						<span className="fixora-notifications__unread-badge">
							{unreadCount} new
						</span>
					)}
				</div>
				{unreadCount > 0 && (
					<button
						className="fixora-notifications__mark-all-btn"
						onClick={onMarkAllAsRead}
					>
						Mark all as read
					</button>
				)}
			</div>

			{/* Notifications List */}
			<div className="fixora-notifications__content">
				{/* Today Section */}
				{groupedNotifications.today.length > 0 && (
					<div className="fixora-notifications__group">
						<h3 className="fixora-notifications__group-title">Today</h3>
						<div className="fixora-notifications__items">
							{groupedNotifications.today.map((notification) => (
								<div
									key={notification.id}
									className={`fixora-notification ${getTypeColor(
										notification.type
									)} ${
										!notification.isRead
											? 'fixora-notification--unread'
											: ''
									}`}
									onMouseEnter={() => setHoveredId(notification.id)}
									onMouseLeave={() => setHoveredId(null)}
									onClick={() => onMarkAsRead?.(notification.id)}
								>
									{/* Icon */}
									<div className="fixora-notification__icon">
										{notification.icon}
									</div>

									{/* Content */}
									<div className="fixora-notification__content">
										<div className="fixora-notification__title">
											{notification.title}
										</div>
										<div className="fixora-notification__description">
											{notification.description}
										</div>
									</div>

									{/* Timestamp & Delete */}
									<div className="fixora-notification__meta">
										<span className="fixora-notification__time">
											{notification.timestamp}
										</span>
										{hoveredId === notification.id && (
											<button
												className="fixora-notification__delete-btn"
												onClick={(e) => {
													e.stopPropagation();
													onDelete?.(notification.id);
												}}
											>
												<DeleteIcon sx={{ fontSize: 16 }} />
											</button>
										)}
									</div>

									{/* Unread Indicator */}
									{!notification.isRead && (
										<div className="fixora-notification__unread-dot" />
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Earlier Section */}
				{groupedNotifications.earlier.length > 0 && (
					<div className="fixora-notifications__group">
						<h3 className="fixora-notifications__group-title">Earlier</h3>
						<div className="fixora-notifications__items">
							{groupedNotifications.earlier.map((notification) => (
								<div
									key={notification.id}
									className={`fixora-notification ${getTypeColor(
										notification.type
									)}`}
									onMouseEnter={() => setHoveredId(notification.id)}
									onMouseLeave={() => setHoveredId(null)}
									onClick={() => onMarkAsRead?.(notification.id)}
								>
									{/* Icon */}
									<div className="fixora-notification__icon">
										{notification.icon}
									</div>

									{/* Content */}
									<div className="fixora-notification__content">
										<div className="fixora-notification__title">
											{notification.title}
										</div>
										<div className="fixora-notification__description">
											{notification.description}
										</div>
									</div>

									{/* Timestamp & Delete */}
									<div className="fixora-notification__meta">
										<span className="fixora-notification__time">
											{notification.timestamp}
										</span>
										{hoveredId === notification.id && (
											<button
												className="fixora-notification__delete-btn"
												onClick={(e) => {
													e.stopPropagation();
													onDelete?.(notification.id);
												}}
											>
												<DeleteIcon sx={{ fontSize: 16 }} />
											</button>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Empty State */}
				{notifications.length === 0 && (
					<div className="fixora-notifications__empty">
						<p>No notifications yet</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default NotificationsList;
