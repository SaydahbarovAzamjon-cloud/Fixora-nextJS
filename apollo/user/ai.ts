import { gql } from '@apollo/client';

const TECHNICIAN_RECOMMENDATION_FIELDS = `
	technicianId
	score
	matchReason
	technician {
		_id
		userNickname
		userFullName
		shopName
		userProfileImage
		specialty
		userLocation
		isOnline
		averageRating
		reviewCount
		completedJobsCount
		badgeLevel
		followersCount
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
`;

export const CLASSIFY_REPAIR_ISSUE = gql`
	query ClassifyRepairIssue($input: ClassifyIssueInput!) {
		classifyRepairIssue(input: $input) {
			deviceType
			issueCategory
			repairComplexity
			confidenceScore
			keywords
			provider
		}
	}
`;

export const RECOMMEND_TECHNICIANS = gql`
	query RecommendTechnicians($input: RecommendTechniciansInput!) {
		recommendTechnicians(input: $input) {
			list {
				${TECHNICIAN_RECOMMENDATION_FIELDS}
			}
		}
	}
`;