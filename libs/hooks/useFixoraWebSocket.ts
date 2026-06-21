import { useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { GET_MY_CONVERSATIONS, GET_MESSAGES } from '../../apollo/user/message';
import { GET_NOTIFICATIONS } from '../../apollo/user/notification';
import { GET_INCOMING_REQUESTS, GET_MY_BOOKINGS, GET_TECHNICIAN_BOOKINGS } from '../../apollo/user/profile';
import { subscribeFixoraWsEvent } from '../utils/fixoraWebSocket';

/**
 * Global Fixora realtime bridge — refetches Apollo queries when FIXORAB emits
 * `notificationReceived` / `messageReceived` over the auth WebSocket.
 */
const useFixoraWebSocket = () => {
	const client = useApolloClient();

	useEffect(() => {
		const refetchNotifications = () => {
			client.refetchQueries({ include: [GET_NOTIFICATIONS] });
		};

		const refetchMessages = () => {
			client.refetchQueries({ include: [GET_MY_CONVERSATIONS, GET_MESSAGES] });
		};

		const refetchBookings = () => {
			client.refetchQueries({
				include: [GET_MY_BOOKINGS, GET_TECHNICIAN_BOOKINGS, GET_INCOMING_REQUESTS],
			});
		};

		const unsubNotification = subscribeFixoraWsEvent('notificationReceived', () => {
			refetchNotifications();
			refetchBookings();
		});

		const unsubMessage = subscribeFixoraWsEvent('messageReceived', () => {
			refetchMessages();
		});

		return () => {
			unsubNotification();
			unsubMessage();
		};
	}, [client]);
};

export default useFixoraWebSocket;
