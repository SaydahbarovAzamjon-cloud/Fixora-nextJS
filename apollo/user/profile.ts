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
				isPaid
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
				deviceData {
					_id
					deviceModel
					deviceBrand
					deviceCategory
					deviceImage
				}
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
				isPaid
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
					deviceImage
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
				isPaid
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
					deviceImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

const TECHNICIAN_BOOKING_FIELDS = `
	_id
	bookingStatus
	bookingType
	bookingDate
	problemTitle
	problemDescription
	estimatedPrice
	finalPrice
	isPaid
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
		deviceImage
	}
`;

export const UPDATE_BOOKING_STATUS = gql`
	mutation UpdateBookingStatus($input: UpdateBookingStatusInput!) {
		updateBookingStatus(input: $input) {
			${TECHNICIAN_BOOKING_FIELDS}
		}
	}
`;

export const COMPLETE_BOOKING = gql`
	mutation CompleteBooking($input: CompleteBookingInput!) {
		completeBooking(input: $input) {
			${TECHNICIAN_BOOKING_FIELDS}
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
					badgeLevel
					userArticles
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

export const GET_USER_LIKED_TECHNICIANS = gql`
	query GetUserLikedTechnicians($input: LikedTechniciansInquiry!) {
		getUserLikedTechnicians(input: $input) {
			list {
				_id
				userNickname
				userFullName
				userProfileImage
				shopName
				specialty
				averageRating
				reviewCount
				badgeLevel
				userArticles
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_PUBLIC_CLIENT_PROFILE = gql`
	query GetPublicClientProfile($clientId: String!) {
		getPublicClientProfile(clientId: $clientId) {
			client {
				_id
				userNickname
				userFullName
				userProfileImage
				userBio
				userLocation
				userType
				followingCount
				reviewCount
				createdAt
			}
			totalBookings
			completedBookings
			totalSpent
			reviewsWritten
			savedTechniciansCount
		}
	}
`;

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
				isFeatured
				allowComments
				articleLikes
				articleViews
				articleComments
				createdAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
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
 *       MY REVIEWS       *
 *************************/

export const GET_MY_REVIEWS = gql`
	query GetMyReviews($input: MyReviewsInquiry!) {
		getMyReviews(input: $input) {
			list {
				_id
				bookingId
				technicianId
				userId
				reviewContent
				repairQuality
				repairSpeed
				communication
				createdAt
				deviceData {
					_id
					deviceModel
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
			verificationDocuments
			verificationStatus
		}
	}
`;
