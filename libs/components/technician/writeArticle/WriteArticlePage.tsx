import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import TranslateOutlined from '@mui/icons-material/TranslateOutlined';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import { userVar } from '../../../../apollo/store';
import { GET_ARTICLE } from '../../../../apollo/user/article';
import { sweetMixinErrorAlert } from '../../../sweetAlert';
import { articleCategoryToRepairCategory } from '../../../utils/articleCategoryMap';
import { useArticleCoverUpload } from '../../../hooks/useArticleCoverUpload';
import { useWriteArticleForm } from '../../../hooks/useWriteArticleForm';
import WriteArticleHeader from './WriteArticleHeader';
import ArticleTitleField, { ShortDescriptionField } from './ArticleTitleField';
import CoverImageUpload from './CoverImageUpload';
import CategoryPills from './CategoryPills';
import MarkdownEditorPanel from './MarkdownEditorPanel';
import LivePreviewCard from './LivePreviewCard';
import SeoSettingsPanel from './SeoSettingsPanel';
import ArticleSettingsPanel from './ArticleSettingsPanel';
import WriteArticleActionBar from './WriteArticleActionBar';
import PreviewFullArticleModal from './PreviewFullArticleModal';

const WriteArticlePage: React.FC = () => {
	const { t, i18n } = useTranslation('technician');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [articleLoaded, setArticleLoaded] = useState(false);

	const editId = typeof router.query.edit === 'string' ? router.query.edit : undefined;
	const isEdit = !!editId;

	const onUploadError = useCallback(
		(key: string) => {
			if (key === 'invalidType') sweetMixinErrorAlert(t('writeArticle.errors.invalidImageType')).then();
			else if (key === 'tooLarge') sweetMixinErrorAlert(t('writeArticle.errors.imageTooLarge')).then();
		},
		[t],
	);

	const coverUpload = useArticleCoverUpload(onUploadError);

	const {
		form,
		patch,
		errors,
		submitting,
		lastSavedAt,
		previewTitle,
		previewExcerpt,
		readMinutes,
		wordCount,
		submit,
		limits,
	} = useWriteArticleForm(user?._id, {
		editId,
		initialContent: '',
		skipDraft: isEdit,
	});

	const { data: articleData, loading: articleLoading, error: articleError } = useQuery(GET_ARTICLE, {
		variables: { input: editId! },
		skip: !editId,
		fetchPolicy: 'network-only',
	});

	useEffect(() => {
		if (!editId || articleLoaded) return;
		const article = articleData?.getArticle;
		if (!article) return;

		patch({
			title: article.articleTitle ?? '',
			excerpt: article.articleExcerpt ?? '',
			content: article.articleContent ?? '',
			categoryId: articleCategoryToRepairCategory(article.articleCategory),
			pubMode: article.articleStatus === 'DRAFT' ? 'draft' : 'publish',
		});
		if (article.articleImage) {
			coverUpload.setExistingImage(article.articleImage);
		}
		setArticleLoaded(true);
	}, [articleData, articleLoaded, editId, patch, coverUpload.setExistingImage]);

	const displayName = user?.memberFullName || user?.memberNick || t('nav.fallbackName');
	const initials = useMemo(
		() =>
			displayName
				.split(' ')
				.map((p) => p.charAt(0))
				.slice(0, 2)
				.join('')
				.toUpperCase(),
		[displayName],
	);

	const handleSaveDraft = () => submit('DRAFT', coverUpload.uploadCover);
	const handlePublish = () => submit('PUBLISHED', coverUpload.uploadCover);

	if (!user?._id) {
		return (
			<div className="ftwa-page ftwa-page--empty">
				<p>{t('writeArticle.loadingUser')}</p>
			</div>
		);
	}

	if (isEdit && articleLoading) {
		return (
			<div className="ftwa-page ftwa-page--empty">
				<p>{t('writeArticle.loadingArticle')}</p>
			</div>
		);
	}

	if (isEdit && articleError) {
		return (
			<div className="ftwa-page ftwa-page--empty">
				<p>{t('writeArticle.loadArticleError')}</p>
			</div>
		);
	}

	return (
		<div className="ftwa-page">
			<WriteArticleHeader isEdit={isEdit} />

			<div className="ftwa-grid">
				<div className="ftwa-grid__left">
					<ArticleTitleField
						value={form.title}
						onChange={(title) => patch({ title })}
						maxLength={limits.titleMax}
						error={errors.title}
					/>
					<CoverImageUpload
						cover={coverUpload.cover}
						previewUrl={coverUpload.previewUrl}
						hasImage={coverUpload.hasImage}
						dragging={coverUpload.dragging}
						fileRef={coverUpload.fileRef}
						onPick={coverUpload.pickFile}
						onDrop={coverUpload.onDrop}
						onDragOver={(e) => {
							e.preventDefault();
							coverUpload.setDragging(true);
						}}
						onDragLeave={() => coverUpload.setDragging(false)}
						onRemove={coverUpload.clearCover}
						onReplace={coverUpload.openPicker}
						onOpenPicker={coverUpload.openPicker}
					/>
					<CategoryPills selected={form.categoryId} onChange={(categoryId) => patch({ categoryId })} />
					<ShortDescriptionField
						value={form.excerpt}
						onChange={(excerpt) => patch({ excerpt })}
						maxLength={limits.excerptMax}
						error={errors.excerpt}
					/>
					<MarkdownEditorPanel
						value={form.content}
						onChange={(content) => patch({ content })}
						readMinutes={readMinutes}
						wordCount={wordCount}
						error={errors.content}
					/>
				</div>

				<div className="ftwa-grid__right">
					<LivePreviewCard
						title={previewTitle}
						excerpt={previewExcerpt}
						categoryId={form.categoryId}
						coverPreviewUrl={coverUpload.previewUrl}
						readMinutes={readMinutes}
					/>
					<SeoSettingsPanel
						metaTitle={form.metaTitle}
						metaDescription={form.metaDescription}
						keywords={form.keywords}
						onMetaTitle={(metaTitle) => patch({ metaTitle })}
						onMetaDescription={(metaDescription) => patch({ metaDescription })}
						onKeywords={(keywords) => patch({ keywords })}
						limits={limits}
						errors={errors}
					/>
					<ArticleSettingsPanel
						pubMode={form.pubMode}
						visibility={form.visibility}
						featured={form.featured}
						allowComments={form.allowComments}
						onPubMode={(pubMode) => patch({ pubMode })}
						onVisibility={(visibility) => patch({ visibility })}
						onFeatured={(featured) => patch({ featured })}
						onAllowComments={(allowComments) => patch({ allowComments })}
					/>
				</div>
			</div>

			<WriteArticleActionBar
				lastSavedAt={lastSavedAt}
				submitting={submitting || coverUpload.uploading}
				onPreview={() => setPreviewOpen(true)}
				onSaveDraft={handleSaveDraft}
				onPublish={handlePublish}
				locale={i18n.language}
				isEdit={isEdit}
			/>

			<div className="ftwa-fabs">
				<button
					type="button"
					className="ftwa-fab"
					title={t('writeArticle.aiAssist')}
					onClick={() => sweetMixinErrorAlert(t('writeArticle.aiAssistSoon')).then()}
				>
					<AutoAwesomeOutlined style={{ fontSize: 16 }} />
				</button>
				<button
					type="button"
					className="ftwa-fab"
					title={t('writeArticle.translateSoon')}
					onClick={() => sweetMixinErrorAlert(t('writeArticle.translateSoon')).then()}
				>
					<TranslateOutlined style={{ fontSize: 16 }} />
				</button>
				<button type="button" className="ftwa-fab" title={t('nav.help')} onClick={() => router.push('/cs')}>
					<HelpOutlineOutlined style={{ fontSize: 16 }} />
				</button>
			</div>

			<PreviewFullArticleModal
				open={previewOpen}
				onClose={() => setPreviewOpen(false)}
				title={form.title}
				excerpt={previewExcerpt}
				content={form.content}
				categoryId={form.categoryId}
				coverPreviewUrl={coverUpload.previewUrl}
				readMinutes={readMinutes}
				authorName={displayName}
				authorRole={t('nav.proTechnician')}
				authorInitials={initials || 'T'}
			/>
		</div>
	);
};

export default WriteArticlePage;
