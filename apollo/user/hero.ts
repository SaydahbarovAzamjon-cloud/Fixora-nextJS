import { gql } from '@apollo/client';

export const HERO_REPAIR_SEARCH = gql`
	query HeroRepairSearch($input: HeroSearchInput!) {
		heroRepairSearch(input: $input) {
			classification {
				deviceType
				issueCategory
				repairComplexity
				confidenceScore
				keywords
				provider
			}
			recommendations {
				technicianId
				score
				matchReason
				technician {
					_id
					userNickname
					userFullName
					shopName
					averageRating
					userProfileImage
					specialty
				}
			}
		}
	}
`;
