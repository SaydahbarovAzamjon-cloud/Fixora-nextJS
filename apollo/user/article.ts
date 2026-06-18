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
