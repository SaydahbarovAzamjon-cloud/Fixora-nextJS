import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import {
	GET_ARTICLE,
	INCREMENT_ARTICLE_VIEW,
	LIKE_TARGET_ARTICLE,
	GET_ARTICLE_COMMENTS,
	CREATE_ARTICLE_COMMENT,
	UPDATE_ARTICLE_COMMENT,
} from '../../apollo/user/article';
import { userVar } from '../../apollo/store';
import { Article, Comment } from '../../libs/types/fixora/fixora';
import PostHeader from '../../libs/components/community/fixora/PostHeader';
import CommentSection from '../../libs/components/community/fixora/CommentSection';
import { sweetErrorHandling } from '../../libs/sweetAlert';

const ToastViewerComponent = dynamic(() => import('../../libs/components/community/TViewer'), {
	ssr: false,
});

const PostDetailPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { id: articleId } = router.query;
	const [article, setArticle] = useState<Article | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentsPage, setCommentsPage] = useState(1);
	const [likePending, setLikePending] = useState(false);
	const [submitCommentPending, setSubmitCommentPending] = useState(false);
	const [viewBump, setViewBump] = useState(0);
	const viewRecordedRef = useRef(false);

	const [incrementArticleView] = useMutation(INCREMENT_ARTICLE_VIEW);

	useEffect(() => {
		if (!article?._id || viewRecordedRef.current) return;
		viewRecordedRef.current = true;
		incrementArticleView({ variables: { articleId: article._id } })
			.then((result) => {
				const views = result.data?.incrementArticleView?.articleViews;
				if (views != null) {
					setArticle((prev) => (prev ? { ...prev, articleViews: views } : null));
				} else {
					setViewBump(1);
				}
			})
			.catch(() => {
				viewRecordedRef.current = false;
			});
	}, [article?._id, incrementArticleView]);

	/** APOLLO REQUESTS **/
	const { data: articleData, loading: articleLoading } = useQuery(GET_ARTICLE, {
		skip: !articleId,
		variables: { input: articleId as string },
		fetchPolicy: 'network-only',
		onCompleted: (result) => {
			setArticle(result?.getArticle);
		},
	});

	const { data: commentsData, loading: commentsLoading, refetch: refetchComments } = useQuery(GET_ARTICLE_COMMENTS, {
		skip: !articleId,
		variables: {
			input: {
				page: commentsPage,
				limit: 10,
				sort: 'createdAt',
				direction: 'DESC',
				search: { commentRefId: articleId as string },
			},
		},
		fetchPolicy: 'cache-and-network',
		onCompleted: (result) => {
			if (commentsPage === 1) {
				setComments(result?.getComments?.list ?? []);
			} else {
				setComments((prev) => [...prev, ...(result?.getComments?.list ?? [])]);
			}
		},
	});

	const commentsTotal = commentsData?.getComments?.metaCounter?.[0]?.total ?? 0;

	const [likeArticle] = useMutation(LIKE_TARGET_ARTICLE);
	const [createComment] = useMutation(CREATE_ARTICLE_COMMENT);
	const [updateComment] = useMutation(UPDATE_ARTICLE_COMMENT);

	/** HANDLERS **/
	const handleLike = async () => {
		if (!user?._id) {
			await sweetErrorHandling(new Error('Please log in to like'));
			return;
		}

		if (!article) return;
		setLikePending(true);

		try {
			const result = await likeArticle({
				variables: { input: article._id },
			});
			const updatedArticle = result.data?.likeTargetArticle;
			if (updatedArticle) {
				setArticle((prev) =>
					prev
						? {
								...prev,
								articleLikes: updatedArticle.articleLikes,
								meLiked: updatedArticle.meLiked,
							}
						: null,
				);
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		} finally {
			setLikePending(false);
		}
	};

	const handleSubmitComment = async (content: string) => {
		if (!user?._id || !article) {
			await sweetErrorHandling(new Error('Please log in to comment'));
			return;
		}

		setSubmitCommentPending(true);

		try {
			await createComment({
				variables: {
					input: {
						commentGroup: 'ARTICLE',
						commentRefId: article._id,
						commentContent: content,
					},
				},
			});

			setCommentsPage(1);
			await refetchComments();

			const updatedArticle = { ...article, articleComments: article.articleComments + 1 };
			setArticle(updatedArticle);
		} catch (err: any) {
			await sweetErrorHandling(err);
		} finally {
			setSubmitCommentPending(false);
		}
	};

	const handleUpdateComment = async (commentId: string, content: string) => {
		try {
			await updateComment({
				variables: {
					input: {
						_id: commentId,
						commentContent: content,
					},
				},
			});

			setComments((prev) =>
				prev.map((c) =>
					c._id === commentId
						? { ...c, commentContent: content, updatedAt: new Date().toISOString() }
						: c,
				),
			);
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const handleDeleteComment = async (commentId: string) => {
		try {
			await updateComment({
				variables: {
					input: {
						_id: commentId,
						commentStatus: 'DELETE',
					},
				},
			});

			setComments((prev) => prev.filter((c) => c._id !== commentId));

			const updatedArticle = { ...article!, articleComments: Math.max(0, article!.articleComments - 1) };
			setArticle(updatedArticle);
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (articleLoading || !article) {
		return (
			<div className="fixora-post-detail-page">
				<div className="fixora-post-detail">
					<div className="fixora-post-detail__loading">Loading article...</div>
				</div>
			</div>
		);
	}

	const isLiked = article.meLiked?.[0]?.myFavorite ?? false;
	const displayArticle = viewBump
		? { ...article, articleViews: (article.articleViews ?? 0) + viewBump }
		: article;

	return (
		<div className="fixora-post-detail-page">
			<div className="fixora-post-detail">
				<PostHeader article={displayArticle} isLiked={isLiked} onLike={handleLike} likePending={likePending} />

				{/* Content */}
				{article.articleContent && (
					<div className="fixora-post-detail__content">
						<ToastViewerComponent markdown={article.articleContent} dark />
					</div>
				)}

				{/* Comments section */}
				<CommentSection
					articleId={article._id}
					comments={comments}
					total={commentsTotal}
					page={commentsPage}
					limit={10}
					onPageChange={setCommentsPage}
					onSubmit={handleSubmitComment}
					onUpdate={handleUpdateComment}
					onDelete={handleDeleteComment}
					currentUserId={user?._id}
					loading={commentsLoading}
					submitting={submitCommentPending}
				/>
			</div>
		</div>
	);
};

export default withLayoutFull(PostDetailPage);
