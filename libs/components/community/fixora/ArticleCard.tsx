import React from 'react';
import Link from 'next/link';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import Moment from 'react-moment';
import { Article } from '../../../types/fixora/fixora';

interface ArticleCardProps {
	article: Article;
	onLike?: (id: string) => void;
	likePending?: boolean;
}

const ArticleCard = ({ article, onLike, likePending = false }: ArticleCardProps) => {
	const isLiked = article.meLiked?.[0]?.myFavorite ?? false;

	const handleLike = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onLike?.(article._id);
	};

	return (
		<Link href={`/community/${article._id}`}>
			<a className="fixora-community__card">
				{/* Thumbnail */}
				<div className="fixora-community__card__thumb">
					{article.articleImage ? (
						<img src={article.articleImage} alt={article.articleTitle} />
					) : (
						<div className="fixora-community__card__thumb--placeholder" />
					)}
				</div>

				{/* Body */}
				<div className="fixora-community__card__body">
					<h3 className="fixora-community__card__title">{article.articleTitle}</h3>
					{article.articleExcerpt && (
						<p className="fixora-community__card__excerpt">{article.articleExcerpt}</p>
					)}

					{/* Meta row: author, date, stats */}
					<div className="fixora-community__card__meta">
						{article.authorData && (
							<div className="fixora-community__card__author">
								{article.authorData.userProfileImage && (
									<img
										src={article.authorData.userProfileImage}
										alt={article.authorData.userNickname}
										className="fixora-community__card__author-avatar"
									/>
								)}
								<div className="fixora-community__card__author-info">
									<span className="fixora-community__card__author-name">
										{article.authorData.userNickname || article.authorData.userFullName}
									</span>
									{article.createdAt && (
										<span className="fixora-community__card__date">
											<Moment fromNow>{article.createdAt}</Moment>
										</span>
									)}
								</div>
							</div>
						)}
					</div>

					{/* Stats: like, view, comment */}
					<div className="fixora-community__card__stats">
						<button
							className={`fixora-community__card__like ${isLiked ? 'fixora-community__card__like--active' : ''}`}
							onClick={handleLike}
							disabled={likePending}
						>
							{isLiked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
							<span>{article.articleLikes}</span>
						</button>
						<div className="fixora-community__card__stat">
							<VisibilityRoundedIcon />
							<span>{article.articleViews}</span>
						</div>
						<div className="fixora-community__card__stat">
							<ChatBubbleOutlineRoundedIcon />
							<span>{article.articleComments}</span>
						</div>
					</div>
				</div>
			</a>
		</Link>
	);
};

export default ArticleCard;
