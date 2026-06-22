import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import ShareOutlined from '@mui/icons-material/ShareOutlined';
import { GET_ARTICLE, INCREMENT_ARTICLE_VIEW, LIKE_TARGET_ARTICLE } from '../../../../apollo/user/article';
import { Article } from '../../../types/fixora/fixora';
import { resolveArticleImageUrl } from '../../../utils/articleImage';
import { estimateArticleReadMinutes } from '../../../utils/articleReadTime';
import { articleCategoryToCommunityFilter } from '../../../utils/communityCategories';
import { formatArticleCount, formatArticlePublishedAt, getArticleTagKeys } from '../../../utils/communityArticleDisplay';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import ArticleAuthorLink from './ArticleAuthorLink';

const TViewer = dynamic(() => import('../TViewer'), { ssr: false });

interface ArticleDetailModalProps {
	articleId: string | null;
	open: boolean;
	onClose: () => void;
	userId?: string;
	isSaved: (articleId: string) => boolean;
	onToggleSave: (articleId: string) => void;
	onViewRecorded?: (articleId: string, baseViews: number) => void;
}

const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
	articleId,
	open,
	onClose,
	userId,
	isSaved,
	onToggleSave,
	onViewRecorded,
}) => {
	const { t, i18n } = useTranslation('common');
	const closeBtnRef = useRef<HTMLButtonElement>(null);
	const [viewRecorded, setViewRecorded] = useState(false);
	const [saved, setSaved] = useState(false);
	const [likePending, setLikePending] = useState(false);
	const [articleOverride, setArticleOverride] = useState<Partial<Article>>({});

	const { data, loading } = useQuery(GET_ARTICLE, {
		skip: !open || !articleId,
		variables: { input: articleId as string },
		fetchPolicy: 'network-only',
	});

	const [likeArticle] = useMutation(LIKE_TARGET_ARTICLE);
	const [incrementArticleView] = useMutation(INCREMENT_ARTICLE_VIEW);

	const article: Article | undefined = data?.getArticle
		? { ...data.getArticle, ...articleOverride }
		: undefined;

	useEffect(() => {
		if (!open) {
			setViewRecorded(false);
			setArticleOverride({});
		}
	}, [open]);

	useEffect(() => {
		if (!open || !articleId) return;
		setSaved(isSaved(articleId));
	}, [open, articleId, isSaved]);

	useEffect(() => {
		if (!open || !article || viewRecorded) return;
		incrementArticleView({ variables: { articleId: article._id } })
			.then((result) => {
				const views = result.data?.incrementArticleView?.articleViews;
				onViewRecorded?.(article._id, article.articleViews ?? 0);
				setViewRecorded(true);
				if (views != null) {
					setArticleOverride((prev) => ({ ...prev, articleViews: views }));
				} else {
					setArticleOverride((prev) => ({
						...prev,
						articleViews: (article.articleViews ?? 0) + 1,
					}));
				}
			})
			.catch(() => {
				/* ignore view tracking failures */
			});
	}, [open, article, viewRecorded, onViewRecorded, incrementArticleView]);

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onKeyDown);
		document.body.style.overflow = 'hidden';
		closeBtnRef.current?.focus();
		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = '';
		};
	}, [open, onClose]);

	const handleLike = useCallback(async () => {
		if (!article) return;
		if (!userId) {
			await sweetErrorHandling(new Error(t('community.loginToLike')));
			return;
		}
		setLikePending(true);
		try {
			const result = await likeArticle({ variables: { input: article._id } });
			const updated = result.data?.likeTargetArticle;
			if (updated) {
				setArticleOverride({
					articleLikes: updated.articleLikes,
					meLiked: updated.meLiked,
				});
			}
		} catch (err) {
			await sweetErrorHandling(err);
		} finally {
			setLikePending(false);
		}
	}, [article, userId, t, likeArticle]);

	const handleSave = useCallback(() => {
		if (!article) return;
		onToggleSave(article._id);
		setSaved((prev) => !prev);
	}, [article, onToggleSave]);

	const handleShare = useCallback(async () => {
		if (!article || typeof window === 'undefined') return;
		const url = `${window.location.origin}/community/${article._id}`;
		try {
			if (navigator.share) {
				await navigator.share({ title: article.articleTitle, url });
				return;
			}
			await navigator.clipboard.writeText(url);
			await sweetTopSmallSuccessAlert(t('community.shareCopied'), 1200);
		} catch {
			/* user cancelled share */
		}
	}, [article, t]);

	if (!open || !articleId || typeof document === 'undefined') return null;

	const coverUrl = resolveArticleImageUrl(article?.articleImage);
	const isLiked = article?.meLiked?.[0]?.myFavorite ?? false;
	const readMinutes = article ? estimateArticleReadMinutes(article) : 1;
	const categoryKey = article?.articleCategory
		? `community.categories.${articleCategoryToCommunityFilter(article.articleCategory)}`
		: null;
	const tagKeys = article ? getArticleTagKeys(article) : [];
	const author = article?.authorData;
	const authorName = author?.userNickname || author?.userFullName || t('community.anonymousAuthor') || 'Author';
	const formattedDate = article?.createdAt
		? formatArticlePublishedAt(article.createdAt, i18n.language)
		: '';

	return createPortal(
		<div className="fixora-article-modal__overlay" onClick={onClose} role="presentation">
			<div
				className="fixora-article-modal"
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="fixora-article-modal-title"
			>
				<div className="fixora-article-modal__head">
					<button
						ref={closeBtnRef}
						type="button"
						className="fixora-article-modal__close"
						onClick={onClose}
						aria-label={t('community.modalClose')}
					>
						<CloseOutlined style={{ fontSize: 20 }} />
					</button>
				</div>

				{loading && !article && (
					<div className="fixora-article-modal__loading">{t('community.loadingArticle')}</div>
				)}

				{article && (
					<div className="fixora-article-modal__scroll">
						{coverUrl && (
							<div className="fixora-article-modal__hero">
								<img src={coverUrl} alt="" loading="lazy" />
							</div>
						)}

						<div className="fixora-article-modal__body">
							<div className="fixora-article-modal__meta-row">
								{categoryKey && (
									<span className="fixora-community__badge">{t(categoryKey)}</span>
								)}
								<span className="fixora-community__read-time">
									{t('community.readTimeShort', { count: readMinutes })}
								</span>
							</div>

							<h2 id="fixora-article-modal-title" className="fixora-article-modal__title">
								{article.articleTitle}
							</h2>

							<div className="fixora-article-modal__author-row">
								<ArticleAuthorLink
									authorId={author?._id}
									name={authorName}
									avatarUrl={author?.userProfileImage}
									showVerified
								/>
								{formattedDate && (
									<span className="fixora-article-modal__date">{formattedDate}</span>
								)}
							</div>

							<div className="fixora-article-modal__content">
								<TViewer markdown={article.articleContent} dark />
							</div>

							{tagKeys.length > 0 && (
								<div className="fixora-article-modal__tags">
									{tagKeys.map((key) => (
										<span key={key} className="fixora-community__tag">
											{key.startsWith('community.') ? t(key) : key}
										</span>
									))}
								</div>
							)}

							<div className="fixora-article-modal__actions">
								<button
									type="button"
									className={`fixora-article-modal__btn ${isLiked ? 'fixora-article-modal__btn--active' : ''}`}
									onClick={handleLike}
									disabled={likePending}
								>
									{isLiked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
									<span>{formatArticleCount(article.articleLikes ?? 0)}</span>
								</button>
								<button
									type="button"
									className={`fixora-article-modal__btn ${saved ? 'fixora-article-modal__btn--active' : ''}`}
									onClick={handleSave}
								>
									{saved ? <BookmarkRoundedIcon /> : <BookmarkBorderRoundedIcon />}
									<span>{t('community.save')}</span>
								</button>
								<button type="button" className="fixora-article-modal__btn" onClick={handleShare}>
									<ShareOutlined />
									<span>{t('community.share')}</span>
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>,
		document.body,
	);
};

export default ArticleDetailModal;
