import { gql } from '@apollo/client';

const ADMIN_USER_FIELDS = gql`
	fragment AdminMutationUserFields on User {
		_id
		userFullName
		userNickname
		userEmail
		userPhoneNumber
		userProfileImage
		userType
		userStatus
		badgeLevel
		verificationStatus
		isVerified
		updatedAt
	}
`;

export const APPROVE_TECHNICIAN = gql`
	${ADMIN_USER_FIELDS}
	mutation ApproveTechnician($userId: String!) {
		approveTechnician(userId: $userId) {
			...AdminMutationUserFields
		}
	}
`;

export const REJECT_TECHNICIAN = gql`
	${ADMIN_USER_FIELDS}
	mutation RejectTechnician($userId: String!, $reason: String) {
		rejectTechnician(userId: $userId, reason: $reason) {
			...AdminMutationUserFields
		}
	}
`;

export const UPDATE_USER_BY_ADMIN = gql`
	${ADMIN_USER_FIELDS}
	mutation UpdateUserByAdmin($input: UserUpdate!) {
		updateUserByAdmin(input: $input) {
			...AdminMutationUserFields
		}
	}
`;

export const UPDATE_ARTICLE_BY_ADMIN = gql`
	mutation UpdateArticleByAdmin($input: ArticleUpdate!) {
		updateArticleByAdmin(input: $input) {
			_id
			articleTitle
			articleStatus
			updatedAt
		}
	}
`;

export const REMOVE_ARTICLE_BY_ADMIN = gql`
	mutation RemoveArticleByAdmin($articleId: String!) {
		removeArticleByAdmin(articleId: $articleId) {
			_id
			articleStatus
		}
	}
`;

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($commentId: String!) {
		removeCommentByAdmin(commentId: $commentId) {
			_id
			commentStatus
		}
	}
`;

export const REMOVE_STORY = gql`
	mutation RemoveStory($storyId: String!) {
		removeStory(storyId: $storyId) {
			_id
		}
	}
`;

export const REVIEW_STORY_REPORT = gql`
	mutation ReviewStoryReport($input: ReviewStoryReportInput!) {
		reviewStoryReport(input: $input) {
			_id
			status
			adminNotes
		}
	}
`;

export const WARN_TECHNICIAN_FOR_STORY = gql`
	mutation WarnTechnicianForStory($input: WarnTechnicianInput!) {
		warnTechnicianForStory(input: $input)
	}
`;

export const REFUND_PAYMENT = gql`
	mutation RefundPayment($paymentId: String!) {
		refundPayment(paymentId: $paymentId) {
			_id
			paymentStatus
		}
	}
`;

export const UPDATE_ADMIN_PLATFORM_SETTINGS = gql`
	mutation UpdateAdminPlatformSettings($input: UpdateAdminPlatformSettingsInput!) {
		updateAdminPlatformSettings(input: $input) {
			defaultLocale
			defaultCurrency
			defaultTimezone
			moderationSlaHours
		}
	}
`;
