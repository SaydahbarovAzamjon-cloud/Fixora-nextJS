import React from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import { GET_ARTICLE_COMMENTS } from '../../../../apollo/user/article';
import { Comment } from '../../../types/fixora/fixora';
import { resolveProfileImageUrl } from '../../../utils/profileImage';
import { formatTimeAgo } from '../../../utils/i18nTime';

interface ArticleCommentsModalProps {
	open: boolean;
	articleId: string;
	articleTitle: string;
	onClose: () => void;
	locale?: string;
}

const ArticleCommentsModal: React.FC<ArticleCommentsModalProps> = ({
	open,
	articleId,
	articleTitle,
	onClose,
	locale,
}) => {
	const { t } = useTranslation('technician');

	const { data, loading, error } = useQuery(GET_ARTICLE_COMMENTS, {
		skip: !open || !articleId,
		variables: {
			input: {
				page: 1,
				limit: 50,
				sort: 'createdAt',
				direction: 'DESC',
				search: { commentRefId: articleId },
			},
		},
		fetchPolicy: 'network-only',
	});

	if (!open) return null;

	const comments: Comment[] = data?.getComments?.list ?? [];
	const total = data?.getComments?.metaCounter?.[0]?.total ?? comments.length;

	return (
		<div className="ftma-modal-overlay" onClick={onClose} role="presentation">
			<div className="ftma-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
				<div className="ftma-modal__header">
					<div>
						<h2>{t('myArticles.comments.title')}</h2>
						<p className="ftma-modal__subtitle">{articleTitle}</p>
					</div>
					<button type="button" className="ftma-modal__close" onClick={onClose} aria-label={t('myArticles.comments.close')}>
						<CloseOutlined style={{ fontSize: 18 }} />
					</button>
				</div>

				<div className="ftma-modal__body">
					{loading && <p className="ftma-modal__message">{t('myArticles.loading')}</p>}
					{error && <p className="ftma-modal__message ftma-modal__message--error">{t('myArticles.error')}</p>}
					{!loading && !error && comments.length === 0 && (
						<p className="ftma-modal__message">{t('myArticles.comments.empty')}</p>
					)}
					{!loading && !error && comments.length > 0 && (
						<ul className="ftma-comments">
							{comments.map((comment) => {
								const author = comment.authorData;
								const name = author?.userNickname || author?.userFullName || t('nav.fallbackName');
								return (
									<li key={comment._id} className="ftma-comments__item">
										<div className="ftma-comments__avatar">
											<img src={resolveProfileImageUrl(author?.userProfileImage)} alt="" />
										</div>
										<div className="ftma-comments__content">
											<div className="ftma-comments__meta">
												<span className="ftma-comments__name">{name}</span>
												<span className="ftma-comments__time">
													{formatTimeAgo(comment.createdAt, t, locale)}
												</span>
											</div>
											<p className="ftma-comments__text">{comment.commentContent}</p>
										</div>
									</li>
								);
							})}
						</ul>
					)}
				</div>

				<div className="ftma-modal__footer">
					<span className="ftma-modal__count">
						{t('myArticles.comments.total', { count: total })}
					</span>
					<a
						href={`/community/${articleId}`}
						className="ftma-modal__link"
						target="_blank"
						rel="noopener noreferrer"
					>
						<OpenInNewOutlined style={{ fontSize: 14 }} />
						{t('myArticles.comments.viewArticle')}
					</a>
				</div>
			</div>
		</div>
	);
};

export default ArticleCommentsModal;
