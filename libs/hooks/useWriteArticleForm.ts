import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { CREATE_ARTICLE, UPDATE_ARTICLE } from '../../apollo/user/article';
import { ArticleInput, ArticleStatus, ArticleUpdate } from '../types/fixora/fixora';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../sweetAlert';
import {
	REPAIR_TO_ARTICLE_CATEGORY,
	RepairCategoryId,
	repairCategoryToDeviceCategory,
} from '../utils/articleCategoryMap';
import { estimateReadMinutes } from '../utils/articleReadTime';
import { isLegacyArticleTemplate } from '../utils/articleContentTemplate';

export type PublicationMode = 'draft' | 'publish' | 'schedule';
export type VisibilityMode = 'public' | 'technicians';

export interface WriteArticleFormState {
	title: string;
	excerpt: string;
	content: string;
	categoryId: RepairCategoryId;
	metaTitle: string;
	metaDescription: string;
	keywords: string;
	pubMode: PublicationMode;
	visibility: VisibilityMode;
	featured: boolean;
	allowComments: boolean;
	scheduledAt: string;
}

export interface FieldErrors {
	title?: string;
	content?: string;
	excerpt?: string;
	metaTitle?: string;
	metaDescription?: string;
	keywords?: string;
	scheduledAt?: string;
}

export interface UseWriteArticleFormOptions {
	editId?: string;
	initialContent?: string;
	skipDraft?: boolean;
}

const TITLE_MAX = 120;
const EXCERPT_MAX = 280;
const META_TITLE_MAX = 60;
const META_DESC_MAX = 160;
const KEYWORDS_MAX = 200;
const CONTENT_MIN = 10;

const DRAFT_KEY_PREFIX = 'fixora_article_draft_';

export function stripMarkdownExcerpt(text: string, max = 140): string {
	const stripped = text.replace(/#+\s|[*_`>|]/g, '').replace(/\s+/g, ' ').trim();
	if (!stripped) return '';
	return stripped.length > max ? `${stripped.slice(0, max)}…` : stripped;
}

export { estimateReadMinutes } from '../utils/articleReadTime';

export function countWords(text: string): number {
	return text.split(/\s+/).filter(Boolean).length;
}

function buildArticleExtras(form: WriteArticleFormState) {
	return {
		seoTitle: form.metaTitle.trim() || undefined,
		seoDescription: form.metaDescription.trim() || undefined,
		seoKeywords: form.keywords.trim() || undefined,
		articleVisibility: form.visibility === 'technicians' ? ('TECHNICIANS_ONLY' as const) : ('PUBLIC' as const),
		isFeatured: form.featured,
		allowComments: form.allowComments,
		repairDeviceCategory: repairCategoryToDeviceCategory(form.categoryId),
		...(form.pubMode === 'schedule' && form.scheduledAt
			? { scheduledPublishAt: new Date(form.scheduledAt).toISOString() }
			: {}),
	};
}

export function useWriteArticleForm(
	userId?: string,
	options: UseWriteArticleFormOptions = {},
) {
	const { editId, initialContent = '', skipDraft = false } = options;
	const router = useRouter();
	const isEdit = !!editId;

	const [form, setForm] = useState<WriteArticleFormState>({
		title: '',
		excerpt: '',
		content: initialContent,
		categoryId: 'macbook',
		metaTitle: '',
		metaDescription: '',
		keywords: '',
		pubMode: 'publish',
		visibility: 'public',
		featured: false,
		allowComments: true,
		scheduledAt: '',
	});
	const [errors, setErrors] = useState<FieldErrors>({});
	const [submitting, setSubmitting] = useState(false);
	const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
	const [createArticle] = useMutation(CREATE_ARTICLE);
	const [updateArticle] = useMutation(UPDATE_ARTICLE);

	const draftKey = !skipDraft && !isEdit && userId ? `${DRAFT_KEY_PREFIX}${userId}` : null;

	useEffect(() => {
		if (!draftKey || typeof window === 'undefined') return;
		try {
			const raw = localStorage.getItem(draftKey);
			if (raw) {
				const parsed = JSON.parse(raw) as Partial<WriteArticleFormState> & { savedAt?: string };
				if (parsed.content && isLegacyArticleTemplate(parsed.content)) {
					parsed.content = '';
				}
				setForm((prev) => ({ ...prev, ...parsed, pubMode: prev.pubMode }));
				if (parsed.savedAt) setLastSavedAt(parsed.savedAt);
			}
		} catch {
			/* ignore corrupt draft */
		}
	}, [draftKey]);

	useEffect(() => {
		if (!draftKey || typeof window === 'undefined') return;
		const timer = setTimeout(() => {
			const savedAt = new Date().toISOString();
			try {
				localStorage.setItem(
					draftKey,
					JSON.stringify({
						title: form.title,
						excerpt: form.excerpt,
						content: form.content,
						categoryId: form.categoryId,
						metaTitle: form.metaTitle,
						metaDescription: form.metaDescription,
						keywords: form.keywords,
						visibility: form.visibility,
						featured: form.featured,
						allowComments: form.allowComments,
						scheduledAt: form.scheduledAt,
						savedAt,
					}),
				);
				setLastSavedAt(savedAt);
			} catch {
				/* quota exceeded */
			}
		}, 2000);
		return () => clearTimeout(timer);
	}, [draftKey, form]);

	const patch = useCallback((partial: Partial<WriteArticleFormState>) => {
		setForm((prev) => ({ ...prev, ...partial }));
		setErrors((prev) => {
			const next = { ...prev };
			Object.keys(partial).forEach((k) => {
				delete next[k as keyof FieldErrors];
			});
			return next;
		});
	}, []);

	const previewTitle = form.title.trim() || '';
	const previewExcerpt = useMemo(() => {
		if (form.excerpt.trim()) return form.excerpt.trim();
		return stripMarkdownExcerpt(form.content);
	}, [form.excerpt, form.content]);

	const readMinutes = useMemo(() => estimateReadMinutes(form.content), [form.content]);
	const wordCount = useMemo(() => countWords(form.content), [form.content]);

	const validate = useCallback(
		(forPublish: boolean): FieldErrors => {
			const next: FieldErrors = {};
			if (form.title.length > TITLE_MAX) next.title = 'titleMax';
			if (form.excerpt.length > EXCERPT_MAX) next.excerpt = 'excerptMax';
			if (form.metaTitle.length > META_TITLE_MAX) next.metaTitle = 'metaTitleMax';
			if (form.metaDescription.length > META_DESC_MAX) next.metaDescription = 'metaDescMax';
			if (form.keywords.length > KEYWORDS_MAX) next.keywords = 'keywordsMax';

			if (forPublish) {
				if (!form.title.trim()) next.title = 'titleRequired';
				if (!form.content.trim() || form.content.trim().length < CONTENT_MIN) {
					next.content = 'contentRequired';
				}
				if (form.pubMode === 'schedule' && !form.scheduledAt) {
					next.scheduledAt = 'scheduleRequired';
				}
			}
			return next;
		},
		[form],
	);

	const submit = useCallback(
		async (status: ArticleStatus, uploadCover?: () => Promise<string | undefined>) => {
			const forPublish = status === 'PUBLISHED';
			const validation = validate(forPublish);
			if (Object.keys(validation).length) {
				setErrors(validation);
				await sweetErrorHandling(new Error('Please fix validation errors before continuing.'));
				return;
			}

			setSubmitting(true);
			try {
				let articleImage: string | undefined;
				if (uploadCover) {
					articleImage = await uploadCover();
				}

				const articleTitle = form.title.trim() || 'Untitled';
				const extras = buildArticleExtras(form);
				const payload = {
					articleTitle,
					articleContent: form.content.trim() || ' ',
					articleExcerpt: form.excerpt.trim() || undefined,
					articleImage,
					articleStatus: status,
					...extras,
				};

				if (isEdit && editId) {
					const result = await updateArticle({
						variables: {
							input: {
								_id: editId,
								...payload,
							} as ArticleUpdate,
						},
					});
					const updatedId = result.data?.updateArticle?._id;
					if (updatedId) {
						await sweetMixinSuccessAlert(
							status === 'DRAFT' ? 'Draft updated successfully.' : 'Article updated successfully.',
							2000,
						);
						router.push('/technician/articles');
					}
				} else {
					const result = await createArticle({
						variables: {
							input: {
								...payload,
								articleCategory: REPAIR_TO_ARTICLE_CATEGORY[form.categoryId],
							} as ArticleInput,
						},
					});

					const newId = result.data?.createArticle?._id;
					if (draftKey) localStorage.removeItem(draftKey);

					if (newId) {
						await sweetMixinSuccessAlert(
							status === 'DRAFT' ? 'Draft saved successfully.' : 'Article published successfully.',
							2000,
						);
						router.push('/technician/articles');
					}
				}
			} catch (err) {
				await sweetErrorHandling(err);
			} finally {
				setSubmitting(false);
			}
		},
		[createArticle, draftKey, editId, form, isEdit, router, updateArticle, validate],
	);

	return {
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
		validate,
		isEdit,
		limits: {
			titleMax: TITLE_MAX,
			excerptMax: EXCERPT_MAX,
			metaTitleMax: META_TITLE_MAX,
			metaDescMax: META_DESC_MAX,
			keywordsMax: KEYWORDS_MAX,
		},
	};
}
