import React from 'react';
import Link from 'next/link';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useNotificationContextOptional } from '../../context/NotificationContext';
import { isTechnicianUser } from '../../utils/userRole';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

const formatBadge = (count: number) => (count > 99 ? '99+' : count);

interface NotificationBellProps {
	/** Dropdown mode — parent renders NotificationDropdown when bell is clicked. */
	onClick?: () => void;
	className?: string;
	/** Override unread count (e.g. filtered navbar list). */
	unreadCount?: number;
	href?: string;
}

/**
 * Navbar notification bell — unread count from NotificationContext (WS-driven).
 */
const NotificationBell = ({ onClick, className = '', unreadCount: unreadOverride, href }: NotificationBellProps) => {
	const user = useReactiveVar(userVar);
	const ctx = useNotificationContextOptional();
	const isTechnician = isTechnicianUser(user);
	const defaultHref = isTechnician ? '/technician/notifications' : '/notifications';
	const targetHref = href ?? defaultHref;
	const unread = unreadOverride ?? ctx?.unreadCount ?? 0;

	const icon = (
		<span className="fixora-nav__icon-wrap">
			<NotificationsOutlinedIcon className="fixora-nav__bell" />
			{unread > 0 && <span className="fixora-nav__badge">{formatBadge(unread)}</span>}
		</span>
	);

	if (onClick) {
		return (
			<button type="button" className={`fixora-nav__icon-btn ${className}`} onClick={onClick}>
				{icon}
			</button>
		);
	}

	return (
		<Link href={targetHref} className={`fixora-nav__icon-link ${className}`}>
			{icon}
		</Link>
	);
};

export default NotificationBell;
