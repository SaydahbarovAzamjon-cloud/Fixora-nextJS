import { gql } from '@apollo/client';

/**************************
 *       CONVERSATIONS    *
 *************************/

export const GET_MY_CONVERSATIONS = gql`
	query GetMyConversations($input: ConversationsInquiry!) {
		getMyConversations(input: $input) {
			list {
				peerId
				bookingId
				bookingStatus
				unreadCount
				updatedAt
				peer {
					_id
					userNickname
					userFullName
					shopName
					userProfileImage
					isOnline
					userType
				}
				lastMessage {
					_id
					senderId
					receiverId
					bookingId
					messageContent
					messageType
					isRead
					createdAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        MESSAGES        *
 *************************/

export const GET_MESSAGES = gql`
	query GetMessages($input: MessagesInquiry!) {
		getMessages(input: $input) {
			list {
				_id
				senderId
				receiverId
				bookingId
				messageContent
				messageType
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

export const SEND_MESSAGE = gql`
	mutation SendMessage($input: SendMessageInput!) {
		sendMessage(input: $input) {
			_id
			senderId
			receiverId
			bookingId
			messageContent
			messageType
			isRead
			createdAt
			updatedAt
		}
	}
`;

export const MARK_MESSAGES_AS_READ = gql`
	mutation MarkMessagesAsRead($input: MarkMessagesAsReadInput!) {
		markMessagesAsRead(input: $input)
	}
`;
