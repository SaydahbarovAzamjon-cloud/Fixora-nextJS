import { gql } from '@apollo/client';

/**************************
 *      MY BOOKINGS       *
 *************************/

export const GET_MY_BOOKINGS = gql`
	query GetMyBookings($input: BookingsInquiry!) {
		getMyBookings(input: $input) {
			list {
				_id
				bookingStatus
				bookingType
				bookingDate
				problemTitle
				problemDescription
				estimatedPrice
				finalPrice
				deviceId
				technicianId
				userId
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *  INCOMING REQUESTS     *
 *  (TECHNICIAN, PENDING) *
 *************************/

export const GET_INCOMING_REQUESTS = gql`
	query GetIncomingRequests($input: BookingsInquiry!) {
		getIncomingRequests(input: $input) {
			list {
				_id
				bookingStatus
				bookingType
				bookingDate
				problemTitle
				problemDescription
				estimatedPrice
				finalPrice
				deviceId
				technicianId
				userId
				createdAt
				aiClassification {
					deviceType
					issueCategory
					repairComplexity
				}
				customerData {
					_id
					userNickname
					userFullName
					userProfileImage
				}
				deviceData {
					_id
					deviceModel
					deviceBrand
					deviceCategory
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *  TECHNICIAN BOOKINGS   *
 *************************/

export const GET_TECHNICIAN_BOOKINGS = gql`
	query GetTechnicianBookings($input: BookingsInquiry!) {
		getTechnicianBookings(input: $input) {
			list {
				_id
				bookingStatus
				bookingType
				bookingDate
				problemTitle
				problemDescription
				estimatedPrice
				finalPrice
				deviceId
				technicianId
				userId
				createdAt
				completedAt
				progressUpdates {
					step
					note
					timestamp
				}
				aiClassification {
					deviceType
					issueCategory
					repairComplexity
				}
				customerData {
					_id
					userNickname
					userFullName
					userProfileImage
				}
				deviceData {
					_id
					deviceModel
					deviceBrand
					deviceCategory
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *   FOLLOWED TECHNICIANS *
 *************************/

export const GET_USER_FOLLOWINGS = gql`
	query GetUserFollowings($input: FollowInquiry!) {
		getUserFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				followingData {
					_id
					userNickname
					userFullName
					shopName
					specialty
					userProfileImage
					averageRating
					reviewCount
					isOnline
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *    PROFILE FOLLOWERS   *
 *************************/

export const GET_USER_FOLLOWERS = gql`
	query GetUserFollowers($input: FollowInquiry!) {
		getUserFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				followerData {
					_id
					userNickname
					userFullName
					userProfileImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      MY ARTICLES       *
 *************************/

export const GET_MY_ARTICLES = gql`
	query GetMyArticles($input: MyArticlesInquiry!) {
		getMyArticles(input: $input) {
			list {
				_id
				articleCategory
				articleTitle
				articleExcerpt
				articleImage
				articleStatus
				articleLikes
				articleViews
				articleComments
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *       MY PAYMENTS      *
 *************************/

export const GET_MY_PAYMENTS = gql`
	query GetMyPayments($input: PaymentsInquiry!) {
		getMyPayments(input: $input) {
			list {
				_id
				bookingId
				paymentAmount
				paymentStatus
				paymentType
				paidAt
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *     PROFILE UPDATE     *
 *************************/

export const UPDATE_USER = gql`
	mutation UpdateUser($input: UserUpdate!) {
		updateUser(input: $input) {
			_id
			userNickname
			userFullName
			userBio
			userLocation
			userProfileImage
		}
	}
`;
