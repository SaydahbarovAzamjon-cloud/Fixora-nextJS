import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberWarnings
			memberBlocks
			memberProperties
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberWarnings
			memberBlocks
			memberProperties
			memberRank
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LIKE_TARGET_USER = gql`
	mutation LikeTargetUser($userId: String!) {
		likeTargetUser(userId: $userId) {
			_id
			userType
			userNickname
			userFullName
			userProfileImage
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *      DEVICE & BOOKING  *
 *************************/

export const CREATE_DEVICE = gql`
	mutation CreateDevice($input: DeviceInput!) {
		createDevice(input: $input) {
			_id
			deviceBrand
			deviceCategory
			deviceModel
			deviceIssue
			deviceDescription
			deviceSerialNumber
			deviceImage
			deviceStatus
			releaseYear
			userId
			createdAt
		}
	}
`;

export const UPDATE_DEVICE = gql`
	mutation UpdateDevice($input: DeviceUpdate!) {
		updateDevice(input: $input) {
			_id
			deviceImage
			updatedAt
		}
	}
`;

export const CREATE_BOOKING = gql`
	mutation CreateBooking($input: BookingInput!) {
		createBooking(input: $input) {
			_id
			bookingStatus
			bookingType
			bookingDate
			problemTitle
			problemDescription
			estimatedPrice
			deviceId
			technicianId
			userId
			createdAt
		}
	}
`;

export const ACCEPT_BOOKING = gql`
	mutation AcceptBooking($bookingId: String!) {
		acceptBooking(bookingId: $bookingId) {
			_id
			bookingStatus
		}
	}
`;

export const REJECT_BOOKING = gql`
	mutation RejectBooking($bookingId: String!) {
		rejectBooking(bookingId: $bookingId) {
			_id
			bookingStatus
		}
	}
`;

export const CANCEL_BOOKING = gql`
	mutation CancelBooking($bookingId: String!) {
		cancelBooking(bookingId: $bookingId) {
			_id
			bookingStatus
			cancelledAt
		}
	}
`;

export const CREATE_REVIEW = gql`
	mutation CreateReview($input: CreateReviewInput!) {
		createReview(input: $input) {
			_id
			bookingId
			technicianId
			reviewContent
			repairQuality
			repairSpeed
			communication
			createdAt
		}
	}
`;

export { INCREMENT_ARTICLE_VIEW, SAVE_ARTICLE, UNSAVE_ARTICLE, CREATE_ARTICLE, UPDATE_ARTICLE, LIKE_TARGET_ARTICLE } from './article';
