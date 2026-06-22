import React from 'react';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import Moment from 'react-moment';
import { useTranslation } from 'next-i18next';
import { Article } from '../../../types/fixora/fixora';
import { resolveArticleImageUrl } from '../../../utils/articleImage';
import ArticleAuthorLink from './ArticleAuthorLink';

interface PostHeaderProps {
	article: Article;
	isLiked: boolean;
	onLike: () => void;
	likePending?: boolean;
}

const PostHeader = ({ article, isLiked, onLike, likePending = false }: PostHeaderProps) => {
	const { t } = useTranslation('common');
	const author = article.authorData;
	const authorName = author?.userNickname || author?.userFullName || t('community.anonymousAuthor') || 'Author';
	const coverUrl = resolveArticleImageUrl(article.articleImage);

	return (
		<div className="fixora-post-detail__header">
			{coverUrl && (
				<div className="fixora-post-detail__hero">
					<img src={coverUrl} alt={article.articleTitle} />
				</div>
			)}

			<h1 className="fixora-post-detail__title">{article.articleTitle}</h1>

			{author && (
				<div className="fixora-post-detail__author">
					<ArticleAuthorLink
						authorId={author._id}
						name={authorName}
						avatarUrl={author.userProfileImage}
						className="fixora-community__author-link fixora-post-detail__author-link"
					/>
					{article.createdAt && (
						<span className="fixora-post-detail__author__date">
							<Moment format="MMM D, YYYY">{article.createdAt}</Moment>
						</span>
					)}
				</div>
			)}

			{/* Stats row: like, view, comment */}
			<div className="fixora-post-detail__stats">
				<button
					className={`fixora-post-detail__stat fixora-post-detail__stat--like ${isLiked ? 'fixora-post-detail__stat--liked' : ''}`}
					onClick={onLike}
					disabled={likePending}
				>
					{isLiked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
					<span>{article.articleLikes}</span>
				</button>
				<div className="fixora-post-detail__stat">
					<VisibilityRoundedIcon />
					<span>{article.articleViews}</span>
				</div>
				<div className="fixora-post-detail__stat">
					<ChatBubbleOutlineRoundedIcon />
					<span>{article.articleComments}</span>
				</div>
			</div>
		</div>
	);
};

export default PostHeader;
