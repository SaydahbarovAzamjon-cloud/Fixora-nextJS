import { gql } from '@apollo/client';

/**************************
 *     FIXORA — USERS     *
 *************************/

export const GET_TECHNICIAN_PLATFORM_STATS = gql`
	query GetTechnicianPlatformStats {
		getTechnicianPlatformStats {
			totalTechnicians
			joinedThisMonth
			joinedLastMonth
			growthPercent
		}
	}
`;

export const GET_TECHNICIAN_TRENDING = gql`
	query GetTechnicianTrending($limit: Float) {
		getTechnicianTrending(limit: $limit) {
			list {
				_id
				userNickname
				userFullName
				userProfileImage
				shopName
				specialty
				userLocation
				shopLatitude
				shopLongitude
				isOnline
				averageRating
				reviewCount
				completedJobsCount
				badgeLevel
				followersCount
				createdAt
				services {
					title
					basePrice
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
		}
	}
`;

export const GET_TECHNICIANS = gql`
	query GetTechnicians($input: TechniciansInquiry!) {
		getTechnicians(input: $input) {
			list {
				_id
				userNickname
				userFullName
				userProfileImage
				shopName
				specialty
				userLocation
				shopLatitude
				shopLongitude
				isOnline
				averageRating
				reviewCount
				completedJobsCount
				avgResponseMinutes
				badgeLevel
				followersCount
				createdAt
				services {
					title
					basePrice
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_USER = gql`
	query GetUser($userId: String!) {
		getUser(userId: $userId) {
			_id
			userNickname
			userSlug
			userFullName
			userProfileImage
			userBio
			shopName
			specialty
			userLocation
			isOnline
			isVerified
			userType
			userStatus
			verificationStatus
			averageRating
			reviewCount
			completedJobsCount
			avgResponseMinutes
			yearsExperience
			badgeLevel
			followersCount
			followingCount
			userArticles
			userEmail
			userPhoneNumber
			createdAt
			meFollowed {
				followingId
				followerId
				myFollowing
			}
			services {
				title
				basePrice
			}
			portfolioImages
			workingHours {
				days
				startTime
				endTime
			}
		}
	}
`;

export const GET_TECHNICIAN_REVIEWS = gql`
	query GetTechnicianReviews($input: ReviewsInquiry!) {
		getTechnicianReviews(input: $input) {
			list {
				_id
				reviewContent
				repairQuality
				repairSpeed
				communication
				createdAt
				userId
				technicianId
				customerData {
					_id
					userNickname
					userFullName
					userProfileImage
				}
				deviceData {
					deviceBrand
					deviceModel
				}
			}
			distribution {
				star
				count
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_USER_REVIEWS = gql`
	query GetUserReviews($input: UserReviewsInquiry!) {
		getUserReviews(input: $input) {
			list {
				_id
				reviewContent
				repairQuality
				repairSpeed
				communication
				createdAt
				technicianId
				technicianData {
					_id
					userNickname
					userFullName
					userProfileImage
					shopName
				}
				deviceData {
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
 *    FIXORA — ARTICLES   *
 *************************/

export const GET_ARTICLES = gql`
	query GetArticles($input: ArticlesInquiry!) {
		getArticles(input: $input) {
			list {
				_id
				articleCategory
				articleTitle
				articleExcerpt
				articleContent
				articleImage
				articleLikes
				articleViews
				articleComments
				isFeatured
				allowComments
				createdAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meSaved {
					articleRefId
					memberId
					mySaved
				}
				authorData {
					_id
					userNickname
					userFullName
					userProfileImage
					specialty
				}
			}
			metaCounter {
				total
			}
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
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				followerData {
					_id
					userType
					userStatus
					authProvider
					userPhoneNumber
					userNickname
					userFullName
					userProfileImage
					userLocation
					userBio
					userArticles
					userLikes
					userViews
					followingCount
					followersCount
					userRank
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_USER_FOLLOWINGS = gql`
	query GetUserFollowings($input: FollowInquiry!) {
		getUserFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followingData {
					_id
					userType
					userStatus
					authProvider
					userPhoneNumber
					userNickname
					userFullName
					userProfileImage
					userLocation
					userBio
					userArticles
					userLikes
					userViews
					followingCount
					followersCount
					userRank
					createdAt
					updatedAt
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MY_DEVICES = gql`
	query GetMyDevices($input: DevicesInquiry!) {
		getMyDevices(input: $input) {
			list {
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
			metaCounter {
				total
			}
		}
	}
`;

export const GET_BOOKING = gql`
	query GetBooking($bookingId: String!) {
		getBooking(bookingId: $bookingId) {
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
			cancelledAt
			progressUpdates {
				step
				note
				timestamp
			}
			deviceData {
				_id
				deviceBrand
				deviceCategory
				deviceModel
				deviceIssue
				deviceImage
			}
		}
	}
`;

export const GET_BOOKING_REVIEW = gql`
	query GetBookingReview($bookingId: String!) {
		getBookingReview(bookingId: $bookingId) {
			_id
			bookingId
			technicianId
			userId
			reviewContent
			repairQuality
			repairSpeed
			communication
			reviewImages
			createdAt
		}
	}
`;

export const GET_DEVICE = gql`
	query GetDevice($deviceId: String!) {
		getDevice(deviceId: $deviceId) {
			_id
			deviceBrand
			deviceCategory
			deviceModel
			deviceIssue
			deviceImage
		}
	}
`;
