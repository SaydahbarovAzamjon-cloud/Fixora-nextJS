import { gql } from '@apollo/client';

export const FIXORA_LOGIN = gql`
	mutation FixoraLogin($input: LoginInput!) {
		login(input: $input) {
			_id
			userType
			userEmail
			userNickname
			userFullName
			userPhoneNumber
			userProfileImage
			authProvider
			profileComplete
			verificationStatus
			accessToken
			refreshToken
		}
	}
`;

export const FIXORA_SIGNUP = gql`
	mutation FixoraSignup($input: UserInput!) {
		signup(input: $input) {
			_id
			userType
			userEmail
			userNickname
			userFullName
			userPhoneNumber
			userProfileImage
			authProvider
			profileComplete
			verificationStatus
			accessToken
			refreshToken
		}
	}
`;

export const LOGIN_WITH_OAUTH = gql`
	mutation LoginWithOAuth($input: OAuthLoginInput!) {
		loginWithOAuth(input: $input) {
			accessToken
			refreshToken
			needsOnboarding
			user {
				_id
				userType
				userEmail
				userNickname
				userFullName
				userPhoneNumber
				userProfileImage
				authProvider
				profileComplete
				verificationStatus
			}
		}
	}
`;

export const COMPLETE_OAUTH_SIGNUP = gql`
	mutation CompleteOAuthSignup($input: CompleteOAuthSignupInput!) {
		completeOAuthSignup(input: $input) {
			_id
			userType
			userEmail
			userNickname
			profileComplete
			verificationStatus
			accessToken
			refreshToken
		}
	}
`;

export const CHECK_SIGNUP_AVAILABILITY = gql`
	query CheckSignupAvailability($input: CheckSignupAvailabilityInput!) {
		checkSignupAvailability(input: $input) {
			available
			conflicts {
				field
				message
			}
		}
	}
`;

export const SUBMIT_TECHNICIAN_VERIFICATION = gql`
	mutation SubmitTechnicianVerification {
		submitTechnicianVerification {
			_id
			verificationStatus
			verificationDocuments
			userProfileImage
		}
	}
`;

/** After Telegram/onboarding — notifies admin only when client has landed. */
export const CONFIRM_AUTH_SESSION = gql`
	mutation ConfirmAuthSession {
		confirmAuthSession {
			_id
			userType
			profileComplete
		}
	}
`;
