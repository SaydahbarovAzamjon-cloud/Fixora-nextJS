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
