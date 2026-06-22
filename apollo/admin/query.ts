import { gql } from '@apollo/client';

const ADMIN_USER_FIELDS = gql`
	fragment AdminUserFields on User {
		_id
		userFullName
		userNickname
		userEmail
		userPhoneNumber
		userProfileImage
		userType
		userStatus
		badgeLevel
		averageRating
		reviewCount
		isVerified
		verificationStatus
		verificationDocuments
		verificationRejectionReason
		shopName
		specialty
		userLocation
		userBio
		yearsExperience
		profileComplete
		services {
			title
			basePrice
		}
		workingHours {
			days
			startTime
			endTime
		}
		createdAt
		updatedAt
	}
`;

export const GET_ALL_USERS_BY_ADMIN = gql`
	${ADMIN_USER_FIELDS}
	query GetAllUsersByAdmin($input: UsersInquiry!) {
		getAllUsersByAdmin(input: $input) {
			list {
				...AdminUserFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_BOOKINGS_BY_ADMIN = gql`
	${ADMIN_USER_FIELDS}
	query GetAllBookingsByAdmin($input: AllBookingsInquiry!) {
		getAllBookingsByAdmin(input: $input) {
			list {
				_id
				bookingStatus
				bookingType
				problemTitle
				problemDescription
				estimatedPrice
				finalPrice
				bookingDate
				createdAt
				technicianId
				userId
				deviceId
				customerData {
					...AdminUserFields
				}
				deviceData {
					_id
					deviceModel
					deviceCategory
					deviceIssue
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_DEVICES_BY_ADMIN = gql`
	query GetAllDevicesByAdmin($input: AllDevicesInquiry!) {
		getAllDevicesByAdmin(input: $input) {
			list {
				_id
				deviceBrand
				deviceCategory
				deviceModel
				deviceIssue
				deviceDescription
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

export const GET_ALL_PAYMENTS_BY_ADMIN = gql`
	query GetAllPaymentsByAdmin($input: AllPaymentsInquiry!) {
		getAllPaymentsByAdmin(input: $input) {
			list {
				_id
				bookingId
				userId
				technicianId
				paymentAmount
				paymentMethod
				paymentStatus
				paymentType
				transactionId
				paidAt
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ALL_ARTICLES_BY_ADMIN = gql`
	${ADMIN_USER_FIELDS}
	query GetAllArticlesByAdmin($input: AllArticlesInquiry!) {
		getAllArticlesByAdmin(input: $input) {
			list {
				_id
				articleTitle
				articleStatus
				articleCategory
				articleViews
				articleLikes
				articleComments
				createdAt
				authorData {
					...AdminUserFields
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_TECHNICIAN_VERIFICATION_QUEUE = gql`
	${ADMIN_USER_FIELDS}
	query GetTechnicianVerificationQueue($input: TechnicianVerificationInquiry!) {
		getTechnicianVerificationQueue(input: $input) {
			list {
				...AdminUserFields
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_STORY_REPORTS = gql`
	${ADMIN_USER_FIELDS}
	query GetStoryReports($input: StoryReportsInquiry!) {
		getStoryReports(input: $input) {
			list {
				_id
				storyId
				userId
				reason
				comment
				status
				createdAt
				reporterData {
					...AdminUserFields
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_STORY = gql`
	${ADMIN_USER_FIELDS}
	query GetStory($storyId: String!) {
		getStory(storyId: $storyId) {
			_id
			caption
			viewCount
			reportCount
			expiresAt
			createdAt
			userId
			userData {
				...AdminUserFields
			}
			images {
				url
				order
			}
		}
	}
`;

export const GET_ADMIN_USER = gql`
	${ADMIN_USER_FIELDS}
	query GetAdminUser($userId: String!) {
		getUser(userId: $userId) {
			...AdminUserFields
		}
	}
`;

export const GET_ADMIN_DASHBOARD_STATS = gql`
	query GetAdminDashboardStats($period: AdminDashboardPeriod!) {
		getAdminDashboardStats(period: $period) {
			period
			totalUsers {
				value
				trendPercent
			}
			totalTechnicians {
				value
				trendPercent
				verifiedCount
			}
			pendingVerifications {
				value
				trendPercent
			}
			totalBookings {
				value
				trendPercent
				activeCount
			}
			platformRevenue {
				value
				trendPercent
			}
			openReports {
				value
				trendPercent
				criticalCount
			}
			monthlySeries {
				month
				revenue
				bookings
			}
		}
	}
`;

export const GET_ADMIN_RECENT_ACTIVITY = gql`
	query GetAdminRecentActivity($limit: Int) {
		getAdminRecentActivity(limit: $limit) {
			eventType
			message
			createdAt
			severity
			actorName
			entityId
		}
	}
`;

export const GET_ADMIN_PAYMENT_SUMMARY = gql`
	query GetAdminPaymentSummary {
		getAdminPaymentSummary {
			totalRevenue
			pendingAmount
			pendingCount
			refundedAmount
			refundedCount
			failedAmount
			failedCount
			currency
		}
	}
`;

export const GET_ALL_COMMENTS_BY_ADMIN = gql`
	query GetAllCommentsByAdmin($input: AllCommentsInquiry!) {
		getAllCommentsByAdmin(input: $input) {
			list {
				_id
				commentContent
				commentStatus
				commentRefId
				createdAt
				articleTitle
				authorData {
					_id
					userNickname
					userImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ADMIN_PLATFORM_SETTINGS = gql`
	query GetAdminPlatformSettings {
		getAdminPlatformSettings {
			defaultLocale
			defaultCurrency
			defaultTimezone
			moderationSlaHours
		}
	}
`;

export const ADMIN_GLOBAL_SEARCH = gql`
	query AdminGlobalSearch($query: String!, $limit: Int) {
		adminGlobalSearch(query: $query, limit: $limit) {
			users {
				_id
				label
				subtitle
				route
			}
			bookings {
				_id
				label
				subtitle
				route
			}
			payments {
				_id
				label
				subtitle
				route
			}
		}
	}
`;
