import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useApolloClient, useReactiveVar } from '@apollo/client';
import { userVar, fixoraWsConnectedVar } from '../../apollo/store';
import { GET_NOTIFICATIONS } from '../../apollo/user/notification';
import { GET_MY_CONVERSATIONS } from '../../apollo/user/message';
import { GET_INCOMING_REQUESTS, GET_MY_BOOKINGS, GET_TECHNICIAN_BOOKINGS } from '../../apollo/user/profile';
import { getJwtToken } from '../auth';
import { Message, Notification } from '../types/fixora/fixora';
import { isCustomerUser, isTechnicianUser } from '../utils/userRole';
import { filterCustomerNotifications } from '../utils/notifications';
import { sweetTopSmallSuccessAlert } from '../sweetAlert';
import {
	connectFixoraWebSocket,
	disconnectFixoraWebSocket,
	subscribeFixoraWsEvent,
} from '../utils/fixoraWebSocket';
import { CustomJwtPayload } from '../types/customJwtPayload';

export type MessageReceivedHandler = (message: Message) => void;

interface NotificationContextValue {
	unreadCount: number;
	wsConnected: boolean;
	refetchNotifications: () => Promise<void>;
	refetchConversations: () => Promise<void>;
	decrementUnread: (by?: number) => void;
	subscribeMessageReceived: (handler: MessageReceivedHandler) => () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

function countUnreadForUser(notifications: Notification[], user: CustomJwtPayload | undefined): number {
	const list = isCustomerUser(user) ? filterCustomerNotifications(notifications) : notifications;
	return list.filter((n) => !n.isRead).length;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
	const client = useApolloClient();
	const user = useReactiveVar(userVar);
	const wsConnected = useReactiveVar(fixoraWsConnectedVar);
	const [unreadCount, setUnreadCount] = useState(0);
	const messageHandlers = useRef(new Set<MessageReceivedHandler>());

	const fetchUnreadCount = useCallback(async () => {
		if (!user?._id || !getJwtToken()) {
			setUnreadCount(0);
			return;
		}
		try {
			const res = await client.query({
				query: GET_NOTIFICATIONS,
				variables: { input: { page: 1, limit: 100, search: { isRead: false } } },
				fetchPolicy: 'network-only',
			});
			const list: Notification[] = res.data?.getNotifications?.list ?? [];
			setUnreadCount(countUnreadForUser(list, user));
		} catch {
			/* keep prior count */
		}
	}, [client, user?._id, user]);

	const refetchNotifications = useCallback(async () => {
		await client.refetchQueries({ include: [GET_NOTIFICATIONS] });
		await fetchUnreadCount();
	}, [client, fetchUnreadCount]);

	const refetchConversations = useCallback(async () => {
		await client.refetchQueries({ include: [GET_MY_CONVERSATIONS] });
	}, [client]);

	const refetchBookings = useCallback(async () => {
		const include = [];
		if (isCustomerUser(user)) include.push(GET_MY_BOOKINGS);
		if (isTechnicianUser(user)) {
			include.push(GET_TECHNICIAN_BOOKINGS, GET_INCOMING_REQUESTS);
		}
		if (include.length) await client.refetchQueries({ include });
	}, [client, user]);

	const decrementUnread = useCallback((by = 1) => {
		setUnreadCount((prev) => Math.max(0, prev - by));
	}, []);

	const subscribeMessageReceived = useCallback((handler: MessageReceivedHandler) => {
		messageHandlers.current.add(handler);
		return () => messageHandlers.current.delete(handler);
	}, []);

	const dispatchMessage = useCallback(
		(data: unknown) => {
			const message = data as Message;
			if (!message?._id) return;
			messageHandlers.current.forEach((handler) => {
				try {
					handler(message);
				} catch {
					/* ignore listener errors */
				}
			});
			void refetchConversations();
		},
		[refetchConversations],
	);

	const handleNotificationReceived = useCallback(
		async (data: unknown) => {
			const notification = data as Notification;
			await Promise.all([refetchNotifications(), refetchBookings()]);

			if (notification?.notificationType === 'MESSAGE') {
				const preview = notification.notificationDescription?.trim();
				if (preview) {
					await sweetTopSmallSuccessAlert(preview, 2500);
				}
			}
		},
		[refetchNotifications, refetchBookings],
	);

	useEffect(() => {
		void fetchUnreadCount();
	}, [fetchUnreadCount]);

	useEffect(() => {
		const token = getJwtToken();
		if (!token || !user?._id) {
			disconnectFixoraWebSocket();
			setUnreadCount(0);
			return;
		}

		connectFixoraWebSocket(token);
		return () => disconnectFixoraWebSocket();
	}, [user?._id]);

	useEffect(() => {
		if (!user?._id || !getJwtToken()) return;

		const unsubNotification = subscribeFixoraWsEvent('notificationReceived', (data) => {
			void handleNotificationReceived(data);
		});
		const unsubMessage = subscribeFixoraWsEvent('messageReceived', (data) => {
			dispatchMessage(data);
		});

		return () => {
			unsubNotification();
			unsubMessage();
		};
	}, [user?._id, handleNotificationReceived, dispatchMessage]);

	const value = useMemo(
		() => ({
			unreadCount,
			wsConnected,
			refetchNotifications,
			refetchConversations,
			decrementUnread,
			subscribeMessageReceived,
		}),
		[unreadCount, wsConnected, refetchNotifications, refetchConversations, decrementUnread, subscribeMessageReceived],
	);

	return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotificationContext(): NotificationContextValue {
	const ctx = useContext(NotificationContext);
	if (!ctx) {
		throw new Error('useNotificationContext must be used within NotificationProvider');
	}
	return ctx;
}

/** Safe hook — returns null when provider is absent (e.g. tests). */
export function useNotificationContextOptional(): NotificationContextValue | null {
	return useContext(NotificationContext);
}
