import { gql } from '@apollo/client';

export const GET_TECHNICIAN_SETTINGS = gql`
	query GetTechnicianSettings($userId: String!) {
		getUser(userId: $userId) {
			_id
			userEmail
			userFullName
			userNickname
			userPhoneNumber
			userLocation
			userBio
			userProfileImage
			userType
			badgeLevel
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
			userNickname
			userFullName
			userBio
			userLocation
			userPhoneNumber
			userProfileImage
			accessToken
			workingHours {
				days
				startTime
				endTime
			}
		}
	}
`;
