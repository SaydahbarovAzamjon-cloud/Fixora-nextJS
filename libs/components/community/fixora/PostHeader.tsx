import React from 'react';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import Moment from 'react-moment';
import { Article } from '../../../types/fixora/fixora';

interface PostHeaderProps {
	article: Article;
	isLiked: boolean;
	onLike: () => void;
	likePending?: boolean;
}

const PostHeader = ({ article, isLiked, onLike, likePending = false }: PostHeaderProps) => {
	return (
		<div className="fixora-post-detail__header">
			{/* Hero Image */}
			{article.articleImage && (
				<div className="fixora-post-detail__hero">
					<img src={article.articleImage} alt={article.articleTitle} />
				</div>
			)}

			{/* Title */}
			<h1 className="fixora-post-detail__title">{article.articleTitle}</h1>

			{/* Author row */}
			{article.authorData && (
				<div className="fixora-post-detail__author">
					{article.authorData.userProfileImage && (
						<img
							src={article.authorData.userProfileImage}
							alt={article.authorData.userNickname}
							className="fixora-post-detail__author__avatar"
						/>
					)}
					<div className="fixora-post-detail__author__info">
						<span className="fixora-post-detail__author__name">
							{article.authorData.userNickname || article.authorData.userFullName}
						</span>
						{article.createdAt && (
							<span className="fixora-post-detail__author__date">
								<Moment format="MMM D, YYYY">{article.createdAt}</Moment>
							</span>
						)}
					</div>
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
