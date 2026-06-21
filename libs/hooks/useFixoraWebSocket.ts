import { useEffect } from 'react';
import { useApolloClient, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { getJwtToken } from '../auth';
import { GET_MY_CONVERSATIONS, GET_MESSAGES } from '../../apollo/user/message';
import { GET_NOTIFICATIONS } from '../../apollo/user/notification';
import { GET_INCOMING_REQUESTS, GET_MY_BOOKINGS, GET_TECHNICIAN_BOOKINGS } from '../../apollo/user/profile';
import { isCustomerUser, isTechnicianUser } from '../utils/userRole';
import {
	connectFixoraWebSocket,
	disconnectFixoraWebSocket,
	subscribeFixoraWsEvent,
} from '../utils/fixoraWebSocket';

/**
 * Global Fixora realtime bridge — maintains auth WS + refetches Apollo on push events.
 */
const useFixoraWebSocket = () => {
	const client = useApolloClient();
	const user = useReactiveVar(userVar);

	useEffect(() => {
		const token = getJwtToken();
		if (!token || !user?._id) {
			disconnectFixoraWebSocket();
			return;
		}

		connectFixoraWebSocket(token);
		return () => disconnectFixoraWebSocket();
	}, [user?._id]);

	useEffect(() => {
		if (!user?._id || !getJwtToken()) return;

		const refetchNotifications = () => {
			client.refetchQueries({ include: [GET_NOTIFICATIONS] });
		};

		const refetchMessages = () => {
			client.refetchQueries({ include: [GET_MY_CONVERSATIONS, GET_MESSAGES] });
		};

		const refetchBookings = () => {
			const include: object[] = [];
			if (isCustomerUser(user)) include.push(GET_MY_BOOKINGS);
			if (isTechnicianUser(user)) {
				include.push(GET_TECHNICIAN_BOOKINGS, GET_INCOMING_REQUESTS);
			}
			if (include.length) client.refetchQueries({ include });
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
	}, [client, user?._id, user?.userType, user?.memberType]);
};

export default useFixoraWebSocket;
