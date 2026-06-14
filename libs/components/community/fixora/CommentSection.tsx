import React, { useState } from 'react';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import FixoraInput from '../../ui/FixoraInput';
import FixoraButton from '../../ui/FixoraButton';
import Moment from 'react-moment';
import { Comment } from '../../../types/fixora/fixora';

interface CommentSectionProps {
	articleId: string;
	comments: Comment[];
	total: number;
	page: number;
	limit: number;
	onPageChange: (page: number) => void;
	onSubmit: (content: string) => void;
	onUpdate: (id: string, content: string) => void;
	onDelete: (id: string) => void;
	currentUserId?: string;
	loading?: boolean;
	submitting?: boolean;
}

const CommentSection = ({
	articleId,
	comments,
	total,
	page,
	limit,
	onPageChange,
	onSubmit,
	onUpdate,
	onDelete,
	currentUserId,
	loading = false,
	submitting = false,
}: CommentSectionProps) => {
	const [composerText, setComposerText] = useState('');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editText, setEditText] = useState('');

	const handleSubmit = async () => {
		if (!composerText.trim()) return;
		onSubmit(composerText);
		setComposerText('');
	};

	const handleEditStart = (comment: Comment) => {
		setEditingId(comment._id);
		setEditText(comment.commentContent);
	};

	const handleEditSave = () => {
		if (!editText.trim() || !editingId) return;
		onUpdate(editingId, editText);
		setEditingId(null);
		setEditText('');
	};

	const handleEditCancel = () => {
		setEditingId(null);
		setEditText('');
	};

	const canLoadMore = total > page * limit;

	return (
		<div className="fixora-post-detail__comments">
			<h2 className="fixora-post-detail__comments__heading">Comments ({total})</h2>

			{/* Composer */}
			{currentUserId && (
				<div className="fixora-post-detail__comments__composer">
					<FixoraInput
						value={composerText}
						onChange={(e: any) => setComposerText(e.target.value)}
						placeholder="Write a comment..."
						className="fixora-post-detail__comments__composer-input"
					/>
					<FixoraButton
						onClick={handleSubmit}
						disabled={!composerText.trim() || submitting}
						variant="primary"
						className="fixora-post-detail__comments__composer-btn"
					>
						Post
					</FixoraButton>
				</div>
			)}

			{/* Comments List */}
			<div className="fixora-post-detail__comments__list">
				{loading ? (
					<div className="fixora-post-detail__comments__loading">Loading comments...</div>
				) : comments.length === 0 ? (
					<div className="fixora-post-detail__comments__empty">No comments yet</div>
				) : (
					comments.map((comment) => {
						const isOwnComment = currentUserId === comment.memberId;

						return (
							<div key={comment._id} className="fixora-post-detail__comments__comment">
								{comment.authorData && (
									<div className="fixora-post-detail__comments__comment-header">
										{comment.authorData.userProfileImage && (
											<img
												src={comment.authorData.userProfileImage}
												alt={comment.authorData.userNickname}
												className="fixora-post-detail__comments__comment-avatar"
											/>
										)}
										<div className="fixora-post-detail__comments__comment-meta">
											<span className="fixora-post-detail__comments__comment-author">
												{comment.authorData.userNickname ||
													comment.authorData.userFullName}
											</span>
											<span className="fixora-post-detail__comments__comment-date">
												<Moment fromNow>{comment.createdAt}</Moment>
											</span>
										</div>
									</div>
								)}

								{/* Comment content — editable or display */}
								{editingId === comment._id ? (
									<div className="fixora-post-detail__comments__comment-edit">
										<FixoraInput
											value={editText}
											onChange={(e: any) => setEditText(e.target.value)}
											className="fixora-post-detail__comments__comment-edit-input"
										/>
										<div className="fixora-post-detail__comments__comment-edit-actions">
											<FixoraButton
												variant="primary"
												onClick={handleEditSave}
												className="fixora-post-detail__comments__comment-edit-save"
											>
												Save
											</FixoraButton>
											<FixoraButton
												variant="outline"
												onClick={handleEditCancel}
												className="fixora-post-detail__comments__comment-edit-cancel"
											>
												Cancel
											</FixoraButton>
										</div>
									</div>
								) : (
									<>
										<p className="fixora-post-detail__comments__comment-content">
											{comment.commentContent}
										</p>

										{/* Actions: edit/delete for own comments */}
										{isOwnComment && (
											<div className="fixora-post-detail__comments__comment-actions">
												<button
													className="fixora-post-detail__comments__comment-edit-btn"
													onClick={() => handleEditStart(comment)}
												>
													Edit
												</button>
												<button
													className="fixora-post-detail__comments__comment-delete-btn"
													onClick={() => onDelete(comment._id)}
													aria-label="Delete comment"
												>
													<DeleteOutlineRoundedIcon />
												</button>
											</div>
										)}
									</>
								)}
							</div>
						);
					})
				)}
			</div>

			{/* Load more button */}
			{canLoadMore && (
				<div className="fixora-post-detail__comments__load-more">
					<FixoraButton
						variant="outline"
						onClick={() => onPageChange(page + 1)}
						className="fixora-post-detail__comments__load-more-btn"
					>
						Load More
					</FixoraButton>
				</div>
			)}
		</div>
	);
};

export default CommentSection;
