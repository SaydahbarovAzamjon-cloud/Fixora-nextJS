import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

/** @deprecated Legacy name — calls Fixora `getTechnicians` with member-field aliases for `/agent` UI. */
export const GET_AGENTS = gql`
	query GetAgents($input: TechniciansInquiry!) {
		getAgents: getTechnicians(input: $input) {
			list {
				_id
				memberType: userType
				memberStatus: userStatus
				memberAuthType: authProvider
				memberPhone: userPhoneNumber
				memberNick: userNickname
				memberFullName: userFullName
				memberImage: userProfileImage
				memberAddress: userLocation
				memberDesc: userBio
				memberProperties: userArticles
				memberRank: userRank
				memberPoints: userRank
				memberLikes: userLikes
				memberViews: userViews
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
			}
			metaCounter {
				total
			}
		}
	}
`;

/** @deprecated Legacy name — calls Fixora `getUser` with member-field aliases. Prefer `GET_USER`. */
export const GET_MEMBER = gql(`
query GetMember($input: String!) {
    getMember: getUser(userId: $input) {
        _id
        memberType: userType
        memberStatus: userStatus
        memberAuthType: authProvider
        memberPhone: userPhoneNumber
        memberNick: userNickname
        memberFullName: userFullName
        memberImage: userProfileImage
        memberAddress: userLocation
        memberDesc: userBio
        memberProperties: userArticles
        memberArticles: userArticles
        memberPoints: userRank
        memberLikes: userLikes
        memberViews: userViews
        memberFollowings: followingCount
				memberFollowers: followersCount
        memberRank: userRank
        deletedAt
        createdAt
        updatedAt
        accessToken
        meFollowed {
					followingId
					followerId
					myFollowing
				}
    }
}
`);

/**************************
 *        PROPERTY        *
 *  Legacy Nestar — not in FixoraB schema; retained for `/property` pages only.
 *************************/

export const GET_PROPERTY = gql`
	query GetProperty($input: String!) {
		getProperty(propertyId: $input) {
			_id
			propertyType
			propertyStatus
			propertyLocation
			propertyAddress
			propertyTitle
			propertyPrice
			propertySquare
			propertyBeds
			propertyRooms
			propertyViews
			propertyLikes
			propertyImages
			propertyDesc
			propertyBarter
			propertyRent
			memberId
			soldAt
			deletedAt
			constructedAt
			createdAt
			updatedAt
			memberData {
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
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
				accessToken
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_PROPERTIES = gql`
	query GetProperties($input: PropertiesInquiry!) {
		getProperties(input: $input) {
			list {
				_id
				propertyType
				propertyStatus
				propertyLocation
				propertyAddress
				propertyTitle
				propertyPrice
				propertySquare
				propertyBeds
				propertyRooms
				propertyViews
				propertyLikes
				propertyRank
				propertyImages
				propertyDesc
				propertyBarter
				propertyRent
				memberId
				soldAt
				deletedAt
				constructedAt
				createdAt
				updatedAt
				memberData {
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
				}
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

export const GET_AGENT_PROPERTIES = gql`
	query GetAgentProperties($input: AgentPropertiesInquiry!) {
		getAgentProperties(input: $input) {
			list {
				_id
				propertyType
				propertyStatus
				propertyLocation
				propertyAddress
				propertyTitle
				propertyPrice
				propertySquare
				propertyBeds
				propertyRooms
				propertyViews
				propertyLikes
				propertyImages
				propertyDesc
				propertyBarter
				propertyRent
				memberId
				soldAt
				deletedAt
				constructedAt
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_FAVORITES = gql`
	query GetFavorites($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
			list {
				_id
				propertyType
				propertyStatus
				propertyLocation
				propertyAddress
				propertyTitle
				propertyPrice
				propertySquare
				propertyBeds
				propertyRooms
				propertyViews
				propertyLikes
				propertyComments
				propertyRank
				propertyImages
				propertyDesc
				propertyBarter
				propertyRent
				memberId
				soldAt
				deletedAt
				constructedAt
				createdAt
				updatedAt
				memberData {
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
					memberProperties
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
			list {
				_id
				propertyType
				propertyStatus
				propertyLocation
				propertyAddress
				propertyTitle
				propertyPrice
				propertySquare
				propertyBeds
				propertyRooms
				propertyViews
				propertyLikes
				propertyComments
				propertyRank
				propertyImages
				propertyDesc
				propertyBarter
				propertyRent
				memberId
				soldAt
				deletedAt
				constructedAt
				createdAt
				updatedAt
				memberData {
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
					memberProperties
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *  @deprecated Prefer `GET_ARTICLE` / `GET_ARTICLES` from `apollo/user/article.ts` or below.
 *************************/

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle: getArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			articleComments
			memberId: userId
			createdAt
			updatedAt
			memberData: authorData {
				_id
				memberType: userType
				memberNick: userNickname
				memberFullName: userFullName
				memberImage: userProfileImage
				memberAddress: userLocation
				memberDesc: userBio
				memberRank: userRank
				memberPoints: userRank
				memberLikes: userLikes
				memberViews: userViews
				createdAt
				updatedAt
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;  

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: ArticlesInquiry!) {
		getBoardArticles: getArticles(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId: userId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData: authorData {
					_id
					memberType: userType
					memberNick: userNickname
					memberFullName: userFullName
					memberImage: userProfileImage
					memberDesc: userBio
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

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData: authorData {
					_id
					memberType: userType
					memberNick: userNickname
					memberFullName: userFullName
					memberImage: userProfileImage
					memberDesc: userBio
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/
/** @deprecated Legacy response key — prefer `GET_USER_FOLLOWERS`. */
export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers: getUserFollowers(input: $input) {
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
					memberType: userType
					memberStatus: userStatus
					memberAuthType: authProvider
					memberPhone: userPhoneNumber
					memberNick: userNickname
					memberFullName: userFullName
					memberImage: userProfileImage
					memberAddress: userLocation
					memberDesc: userBio
					memberProperties: userArticles
					memberArticles: userArticles
					memberPoints: userRank
					memberLikes: userLikes
					memberViews: userViews
					memberFollowings: followingCount
					memberFollowers: followersCount
					memberRank: userRank
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

/** @deprecated Legacy response key — prefer `GET_USER_FOLLOWINGS`. */
export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings: getUserFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followingData {
					_id
					memberType: userType
					memberStatus: userStatus
					memberAuthType: authProvider
					memberPhone: userPhoneNumber
					memberNick: userNickname
					memberFullName: userFullName
					memberImage: userProfileImage
					memberAddress: userLocation
					memberDesc: userBio
					memberProperties: userArticles
					memberArticles: userArticles
					memberPoints: userRank
					memberLikes: userLikes
					memberViews: userViews
					memberFollowings: followingCount
					memberFollowers: followersCount
					memberRank: userRank
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
