import { gql } from '@apollo/client';

export const GET_TECHNICIAN_SETTINGS = gql`
	query GetTechnicianSettings($userId: String!) {
		getUser(userId: $userId) {
			_id
			userEmail
			userFullName
			userNickname
			userSlug
			userPhoneNumber
			userLocation
			userBio
			shopName
			shopLatitude
			shopLongitude
			specialty
			services {
				title
				basePrice
			}
			userProfileImage
			userType
			badgeLevel
			twoFactorEnabled
			workingHours {
				days
				startTime
				endTime
			}
		}
	}
`;

export const UPDATE_TECHNICIAN_SETTINGS = gql`
	mutation UpdateTechnicianSettings($input: UserUpdate!) {
		updateUser(input: $input) {
			_id
			userEmail
			userNickname
			userFullName
			shopName
			userBio
			userLocation
			userPhoneNumber
			userProfileImage
			specialty
			userSlug
			accessToken
			workingHours {
				days
				startTime
				endTime
			}
		}
	}
`;

export const CHANGE_PASSWORD = gql`
	mutation ChangePassword($input: ChangePasswordInput!) {
		changePassword(input: $input)
	}
`;

export const UPDATE_EMAIL = gql`
	mutation UpdateEmail($input: UpdateEmailInput!) {
		updateEmail(input: $input) {
			_id
			userEmail
		}
	}
`;

export const UPDATE_USER_SLUG = gql`
	mutation UpdateUserSlug($input: UpdateUserSlugInput!) {
		updateUserSlug(input: $input) {
			_id
			userSlug
		}
	}
`;

export const DELETE_ACCOUNT = gql`
	mutation DeleteAccount($input: DeleteAccountInput!) {
		deleteAccount(input: $input)
	}
`;

export const ENABLE_2FA = gql`
	mutation Enable2FA {
		enable2FA {
			secret
			provisioningUri
		}
	}
`;

export const VERIFY_2FA_SETUP = gql`
	mutation Verify2FASetup($input: VerifyTwoFactorInput!) {
		verify2FASetup(input: $input)
	}
`;

export const DISABLE_2FA = gql`
	mutation Disable2FA($input: DisableTwoFactorInput!) {
		disable2FA(input: $input)
	}
`;

export const GET_TWO_FACTOR_STATUS = gql`
	query GetTwoFactorStatus {
		getTwoFactorStatus
	}
`;

export const GET_NOTIFICATION_PREFERENCES = gql`
	query GetNotificationPreferences {
		getNotificationPreferences {
			bookingUpdates
			messages
			payments
			reviews
			marketing
			followAlerts
			emailDigest
			notificationLanguage
			emailEnabled
			inAppEnabled
			telegramEnabled
			smsEnabled
			pushEnabled
			connectedEmail
			emailSource
			telegramStatus
			telegramUsername
		}
	}
`;

export const UPDATE_NOTIFICATION_PREFERENCES = gql`
	mutation UpdateNotificationPreferences($input: NotificationPreferencesInput!) {
		updateNotificationPreferences(input: $input) {
			bookingUpdates
			messages
			payments
			reviews
			marketing
			followAlerts
			emailDigest
			notificationLanguage
			emailEnabled
			inAppEnabled
			telegramEnabled
			smsEnabled
			pushEnabled
			connectedEmail
			emailSource
			telegramStatus
			telegramUsername
		}
	}
`;

export const REQUEST_TELEGRAM_LINK = gql`
	mutation RequestTelegramLink {
		requestTelegramLink {
			linkUrl
			expiresAt
		}
	}
`;

export const DISCONNECT_TELEGRAM = gql`
	mutation DisconnectTelegram {
		disconnectTelegram {
			_id
			telegramLink {
				status
				username
				linkedAt
			}
			notificationPreferences {
				telegramEnabled
				telegramStatus
				telegramUsername
			}
		}
	}
`;

export const GET_USER_PREFERENCES = gql`
	query GetUserPreferences {
		getUserPreferences {
			language
			currency
			timezone
			darkMode
		}
	}
`;

export const UPDATE_USER_PREFERENCES = gql`
	mutation UpdateUserPreferences($input: UserPreferencesInput!) {
		updateUserPreferences(input: $input) {
			language
			currency
			timezone
			darkMode
		}
	}
`;

export const GET_PAYMENT_METHODS = gql`
	query GetPaymentMethods {
		getPaymentMethods {
			list {
				_id
				methodLabel
				methodType
				maskedNumber
				isPrimary
			}
		}
	}
`;

export const CREATE_PAYMENT_METHOD = gql`
	mutation CreatePaymentMethod($input: CreatePaymentMethodInput!) {
		createPaymentMethod(input: $input) {
			_id
			methodLabel
			methodType
			maskedNumber
			isPrimary
		}
	}
`;

export const UPDATE_PAYMENT_METHOD = gql`
	mutation UpdatePaymentMethod($input: UpdatePaymentMethodInput!) {
		updatePaymentMethod(input: $input) {
			_id
			methodLabel
			methodType
			maskedNumber
			isPrimary
		}
	}
`;

export const DELETE_PAYMENT_METHOD = gql`
	mutation DeletePaymentMethod($paymentMethodId: String!) {
		deletePaymentMethod(paymentMethodId: $paymentMethodId)
	}
`;
