import { gql } from '@apollo/client';

/**************************
 *      NOTIFICATIONS     *
 *************************/

export const GET_NOTIFICATIONS = gql`
	query GetNotifications($input: NotificationsInquiry!) {
		getNotifications(input: $input) {
			list {
				_id
				userId
				receiverId
				notificationType
				notificationTitle
				notificationDescription
				referenceType
				referenceId
				isRead
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const MARK_NOTIFICATION_READ = gql`
	mutation MarkNotificationRead($input: MarkNotificationReadInput!) {
		markNotificationRead(input: $input) {
			_id
			isRead
		}
	}
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
	mutation MarkAllNotificationsRead {
		markAllNotificationsRead
	}
`;
