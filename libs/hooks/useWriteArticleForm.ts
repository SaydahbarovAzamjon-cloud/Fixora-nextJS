import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { CREATE_ARTICLE } from '../../apollo/user/article';
import { ArticleInput, ArticleStatus } from '../types/fixora/fixora';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../sweetAlert';
import {
	REPAIR_TO_ARTICLE_CATEGORY,
	RepairCategoryId,
} from '../utils/articleCategoryMap';

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
}

export interface FieldErrors {
	title?: string;
	content?: string;
	excerpt?: string;
	metaTitle?: string;
	metaDescription?: string;
	keywords?: string;
}

const TITLE_MAX = 120;
const EXCERPT_MAX = 280;
const META_TITLE_MAX = 60;
const META_DESC_MAX = 160;
const KEYWORDS_MAX = 200;
const CONTENT_MIN = 10;

export function stripMarkdownExcerpt(text: string, max = 140): string {
	const stripped = text.replace(/#+\s|[*_`>|]/g, '').replace(/\s+/g, ' ').trim();
	if (!stripped) return '';
	return stripped.length > max ? `${stripped.slice(0, max)}…` : stripped;
}

export function estimateReadMinutes(text: string): number {
	const words = text.split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 200));
}

export function countWords(text: string): number {
	return text.split(/\s+/).filter(Boolean).length;
}

const DRAFT_KEY_PREFIX = 'fixora_article_draft_';

export function useWriteArticleForm(userId?: string, initialContent = '') {
	const router = useRouter();
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
	});
	const [errors, setErrors] = useState<FieldErrors>({});
	const [submitting, setSubmitting] = useState(false);
	const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
	const [createArticle] = useMutation(CREATE_ARTICLE);

	const draftKey = userId ? `${DRAFT_KEY_PREFIX}${userId}` : null;

	useEffect(() => {
		if (!draftKey || typeof window === 'undefined') return;
		try {
			const raw = localStorage.getItem(draftKey);
			if (raw) {
				const parsed = JSON.parse(raw) as Partial<WriteArticleFormState> & { savedAt?: string };
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
			}
			return next;
		},
		[form],
	);

	const submit = useCallback(
		async (status: ArticleStatus, uploadCover?: () => Promise<string | undefined>) => {
			const forPublish = status === 'PUBLISHED';
			if (form.pubMode === 'schedule' && forPublish) {
				await sweetErrorHandling(new Error('Schedule publication is not available yet.'));
				return;
			}

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
				const result = await createArticle({
					variables: {
						input: {
							articleTitle,
							articleContent: form.content.trim() || ' ',
							articleExcerpt: form.excerpt.trim() || undefined,
							articleCategory: REPAIR_TO_ARTICLE_CATEGORY[form.categoryId],
							articleImage,
							articleStatus: status,
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
					router.push(`/community/${newId}`);
				}
			} catch (err) {
				await sweetErrorHandling(err);
			} finally {
				setSubmitting(false);
			}
		},
		[createArticle, draftKey, form, router, validate],
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
		limits: {
			titleMax: TITLE_MAX,
			excerptMax: EXCERPT_MAX,
			metaTitleMax: META_TITLE_MAX,
			metaDescMax: META_DESC_MAX,
			keywordsMax: KEYWORDS_MAX,
		},
	};
}
