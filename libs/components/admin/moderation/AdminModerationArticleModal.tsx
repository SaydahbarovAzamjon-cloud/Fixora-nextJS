import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'next-i18next';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';
import { GET_ADMIN_ARTICLE } from '../../../../apollo/admin/query';
import { UPDATE_ARTICLE_BY_ADMIN } from '../../../../apollo/admin/mutation';
import type { AdminArticle } from '../../../types/admin/admin';
import { deleteArticleByAdmin } from '../../../utils/adminArticleActions';
import { displayUserName } from '../../../hooks/useUserLookup';
import { resolveProfileImageUrl } from '../../../utils/profileImage';
import { resolveArticleImageUrl } from '../../../utils/articleImage';
import { dateLocale } from '../../../utils/i18nLocale';
import AdminStatusBadge from '../shared/AdminStatusBadge';
import AdminModerationArticleThumb from './AdminModerationArticleThumb';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../sweetAlert';

const TViewer = dynamic(() => import('../../community/TViewer'), { ssr: false });

interface AdminModerationArticleModalProps {
	articleId: string | null;
	open: boolean;
	onClose: () => void;
	onUpdated: () => void;
}

const articleStatusTone = (status: string) => {
	switch (status) {
		case 'PUBLISHED':
		case 'ACTIVE':
			return 'success' as const;
		case 'DRAFT':
			return 'warning' as const;
		case 'DELETE':
			return 'danger' as const;
		default:
			return 'neutral' as const;
	}
};

const AdminModerationArticleModal: React.FC<AdminModerationArticleModalProps> = ({
	articleId,
	open,
	onClose,
	onUpdated,
}) => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const client = useApolloClient();

	const { data, loading } = useQuery(GET_ADMIN_ARTICLE, {
		variables: { articleId: articleId as string },
		skip: !open || !articleId,
		fetchPolicy: 'network-only',
	});

	const [updateArticle, { loading: updating }] = useMutation(UPDATE_ARTICLE_BY_ADMIN);
	const [deleting, setDeleting] = useState(false);

	const article: AdminArticle | undefined = data?.getArticle;

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [open, onClose]);

	if (!open || typeof document === 'undefined') return null;

	const run = async (action: () => Promise<unknown>) => {
		try {
			await action();
			await sweetTopSmallSuccessAlert(t('common.success'), 1200);
			onUpdated();
			onClose();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const handleDelete = async () => {
		if (!articleId || !window.confirm(t('moderation.articles.modal.confirmDelete'))) return;
		setDeleting(true);
		try {
			await deleteArticleByAdmin(client, articleId);
			await sweetTopSmallSuccessAlert(t('common.success'), 1200);
			onUpdated();
			onClose();
		} catch (err) {
			await sweetErrorHandling(err);
		} finally {
			setDeleting(false);
		}
	};

	const handleHide = () => {
		if (!article?._id || !window.confirm(t('moderation.articles.modal.confirmHide'))) return;
		run(() =>
			updateArticle({
				variables: { input: { _id: article._id, articleStatus: 'DRAFT' } },
			}),
		);
	};

	const handleRestore = () => {
		if (!article?._id || !window.confirm(t('moderation.articles.modal.confirmRestore'))) return;
		run(() =>
			updateArticle({
				variables: { input: { _id: article._id, articleStatus: 'PUBLISHED' } },
			}),
		);
	};

	const isHidden = article?.articleStatus === 'DELETE' || article?.articleStatus === 'DRAFT';

	const author = article?.authorData;
	const authorName = displayUserName(author);
	const coverUrl = resolveArticleImageUrl(article?.articleImage);

	return createPortal(
		<div className="fixora-admin-modal-backdrop" role="presentation" onClick={onClose}>
			<div
				className="fixora-admin-modal fixora-admin-modal--article"
				role="dialog"
				aria-modal="true"
				aria-labelledby="admin-article-modal-title"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="fixora-admin-modal--article__header">
					<h3 id="admin-article-modal-title" className="fixora-admin-modal__title">
						{t('moderation.articles.modal.title')}
					</h3>
					<button
						type="button"
						className="fixora-admin-table-actions__btn"
						onClick={onClose}
						aria-label={t('moderation.articles.modal.close')}
					>
						<X size={16} />
					</button>
				</div>

				{loading && <div className="fixora-admin-empty">{t('common.loading')}</div>}

				{!loading && article && (
					<div className="fixora-admin-modal--article__body">
						<div className="fixora-admin-modal--article__cover-row">
							{coverUrl ? (
								<img
									src={coverUrl}
									alt=""
									className="fixora-admin-modal--article__cover"
									loading="lazy"
									decoding="async"
								/>
							) : (
								<AdminModerationArticleThumb image={null} title={article.articleTitle} />
							)}
							<div className="fixora-admin-modal--article__meta">
								<h4 className="fixora-admin-modal--article__article-title">{article.articleTitle}</h4>
								<div className="fixora-admin-author-cell">
									<div className="fixora-admin-table-user">
										<div className="fixora-admin-table-user__avatar">
											<img src={resolveProfileImageUrl(author?.userProfileImage)} alt="" />
										</div>
										<div className="fixora-admin-author-cell__text">
											<span className="fixora-admin-author-cell__name">{authorName}</span>
											{author?.userNickname && (
												<span className="fixora-admin-author-cell__handle">@{author.userNickname}</span>
											)}
										</div>
									</div>
								</div>
								<div className="fixora-admin-modal--article__badges">
									{article.articleCategory && (
										<AdminStatusBadge label={article.articleCategory} tone="neutral" />
									)}
									<AdminStatusBadge
										label={article.articleStatus}
										tone={articleStatusTone(article.articleStatus)}
									/>
								</div>
								<p className="fixora-admin-verification__list-meta">
									{t('moderation.articles.modal.created')}:{' '}
									{new Date(article.createdAt).toLocaleString(dateLocale(router.locale))}
								</p>
								<div className="fixora-admin-modal--article__stats">
									<span>{t('moderation.views', { count: article.articleViews })}</span>
									<span>{t('moderation.articles.modal.likes', { count: article.articleLikes })}</span>
									<span>
										{t('moderation.articles.modal.comments', { count: article.articleComments })}
									</span>
								</div>
							</div>
						</div>

						{article.articleExcerpt && (
							<p className="fixora-admin-modal--article__excerpt">{article.articleExcerpt}</p>
						)}

						<div className="fixora-admin-modal--article__content">
							<TViewer markdown={article.articleContent} dark />
						</div>
					</div>
				)}

				<div className="fixora-admin-modal--article__footer">
					<button
						type="button"
						className="fixora-admin-btn fixora-admin-btn--outline"
						onClick={onClose}
						disabled={deleting || updating}
					>
						{t('moderation.articles.modal.close')}
					</button>
					{isHidden ? (
						<button
							type="button"
							className="fixora-admin-btn fixora-admin-btn--secondary"
							onClick={handleRestore}
							disabled={deleting || updating || !article}
						>
							{t('moderation.articles.modal.restore')}
						</button>
					) : (
						<button
							type="button"
							className="fixora-admin-btn fixora-admin-btn--secondary"
							onClick={handleHide}
							disabled={deleting || updating || !article}
						>
							{t('moderation.articles.modal.hide')}
						</button>
					)}
					<button
						type="button"
						className="fixora-admin-btn fixora-admin-btn--danger-outline"
						onClick={handleDelete}
						disabled={deleting || updating || !articleId}
					>
						{t('moderation.articles.modal.delete')}
					</button>
				</div>
			</div>
		</div>,
		document.body,
	);
};

export default AdminModerationArticleModal;
