import { gql } from '@apollo/client';

/** Story operations — 24h technician stories (see docs/STORY_CREATE_FRONTEND.md).
 *  Image upload (imagesUploader, target: "story") is done via multipart axios,
 *  following the existing project pattern (libs/components/mypage/AddNewProperty.tsx). */

export const CREATE_STORY = gql`
	mutation CreateStory($input: CreateStoryInput!) {
		createStory(input: $input) {
			_id
			userId
			images {
				url
				order
			}
			caption
			viewCount
			createdAt
			expiresAt
			isExpired
		}
	}
`;

export const GET_TECHNICIAN_STORIES = gql`
	query GetTechnicianStories($input: TechnicianStoriesInquiry!) {
		getTechnicianStories(input: $input) {
			list {
				_id
				userId
				images {
					url
					order
				}
				caption
				viewCount
				createdAt
				expiresAt
				isExpired
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_STORIES_CAROUSEL = gql`
	query GetStoriesCarousel($input: StoriesCarouselInquiry!) {
		getStoriesCarousel(input: $input) {
			list {
				_id
				userId
				images {
					url
					order
				}
				caption
				viewCount
				createdAt
				expiresAt
				isExpired
				userData {
					_id
					userNickname
					userFullName
					userProfileImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const INCREMENT_STORY_VIEW = gql`
	mutation IncrementStoryView($storyId: String!) {
		incrementStoryView(storyId: $storyId) {
			_id
			viewCount
		}
	}
`;
