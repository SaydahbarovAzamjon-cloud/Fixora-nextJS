import { gql } from '@apollo/client';

/** Article queries and mutations for P3-10 (Community + Post Detail) */

export const GET_ARTICLE = gql`
	query GetArticle($input: String!) {
		getArticle(articleId: $input) {
			_id
			articleCategory
			articleTitle
			articleContent
			articleExcerpt
			articleImage
			articleStatus
			articleLikes
			articleViews
			articleComments
			articleVisibility
			isFeatured
			allowComments
			scheduledPublishAt
			seoTitle
			seoDescription
			seoKeywords
			repairDeviceCategory
			userId
			createdAt
			updatedAt
			authorData {
				_id
				userNickname
				userFullName
				userProfileImage
				specialty
				shopName
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
			meSaved {
				articleRefId
				memberId
				mySaved
			}
		}
	}
`;

export const LIKE_TARGET_ARTICLE = gql`
	mutation LikeTargetArticle($input: String!) {
		likeTargetArticle(articleId: $input) {
			_id
			articleLikes
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const CREATE_ARTICLE = gql`
	mutation CreateArticle($input: ArticleInput!) {
		createArticle(input: $input) {
			_id
			articleCategory
			articleTitle
			articleContent
			articleExcerpt
			articleImage
			articleStatus
			articleLikes
			articleViews
			articleComments
			articleVisibility
			isFeatured
			allowComments
			scheduledPublishAt
			seoTitle
			seoDescription
			seoKeywords
			repairDeviceCategory
			createdAt
		}
	}
`;

export const GET_ARTICLE_COMMENTS = gql`
	query GetArticleComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentContent
				commentGroup
				commentRefId
				commentStatus
				memberId
				createdAt
				updatedAt
				authorData {
					_id
					userNickname
					userFullName
					userProfileImage
					specialty
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const CREATE_ARTICLE_COMMENT = gql`
	mutation CreateArticleComment($input: CommentInput!) {
		createComment(input: $input) {
			_id
			commentContent
			commentGroup
			commentRefId
			commentStatus
			memberId
			createdAt
			updatedAt
			authorData {
				_id
				userNickname
				userFullName
				userProfileImage
			}
		}
	}
`;

export const UPDATE_ARTICLE_COMMENT = gql`
	mutation UpdateArticleComment($input: CommentUpdate!) {
		updateComment(input: $input) {
			_id
			commentContent
			commentStatus
			updatedAt
		}
	}
`;

export const UPDATE_ARTICLE = gql`
	mutation UpdateArticle($input: ArticleUpdate!) {
		updateArticle(input: $input) {
			_id
			articleCategory
			articleTitle
			articleContent
			articleExcerpt
			articleImage
			articleStatus
			articleLikes
			articleViews
			articleComments
			articleVisibility
			isFeatured
			allowComments
			scheduledPublishAt
			seoTitle
			seoDescription
			seoKeywords
			repairDeviceCategory
			updatedAt
		}
	}
`;

export const DELETE_ARTICLE = gql`
	mutation DeleteArticle($articleId: String!) {
		deleteArticle(articleId: $articleId) {
			_id
			articleStatus
		}
	}
`;

export const SAVE_ARTICLE = gql`
	mutation SaveArticle($articleId: String!) {
		saveArticle(articleId: $articleId) {
			_id
			meSaved {
				articleRefId
				memberId
				mySaved
			}
		}
	}
`;

export const UNSAVE_ARTICLE = gql`
	mutation UnsaveArticle($articleId: String!) {
		unsaveArticle(articleId: $articleId) {
			_id
			meSaved {
				articleRefId
				memberId
				mySaved
			}
		}
	}
`;

export const INCREMENT_ARTICLE_VIEW = gql`
	mutation IncrementArticleView($articleId: String!) {
		incrementArticleView(articleId: $articleId) {
			_id
			articleViews
		}
	}
`;
