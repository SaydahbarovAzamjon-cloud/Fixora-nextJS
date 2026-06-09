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
