import React, { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import FixoraInput from '../../ui/FixoraInput';
import FixoraSelect from '../../ui/FixoraSelect';
import FixoraButton from '../../ui/FixoraButton';
import { CREATE_ARTICLE } from '../../../../apollo/user/article';
import { ArticleCategory, ArticleInput } from '../../../types/fixora/fixora';
import { sweetErrorHandling } from '../../../sweetAlert';

interface ArticleEditorProps {
	onSuccess?: (articleId: string) => void;
}

const ArticleEditor = ({ onSuccess }: ArticleEditorProps) => {
	const router = useRouter();
	const editorRef = useRef<any>(null);
	const [title, setTitle] = useState('');
	const [category, setCategory] = useState<ArticleCategory>('FREE');
	const [excerpt, setExcerpt] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const [createArticle] = useMutation(CREATE_ARTICLE);

	const handleSubmit = async () => {
		if (!title.trim()) {
			await sweetErrorHandling(new Error('Title is required'));
			return;
		}

		if (!editorRef.current) {
			await sweetErrorHandling(new Error('Editor not ready'));
			return;
		}

		const content = editorRef.current.getInstance().getMarkdown();

		if (!content.trim()) {
			await sweetErrorHandling(new Error('Content is required'));
			return;
		}

		setSubmitting(true);

		try {
			const result = await createArticle({
				variables: {
					input: {
						articleTitle: title,
						articleContent: content,
						articleCategory: category,
						articleExcerpt: excerpt || undefined,
						articleStatus: 'PUBLISHED',
					} as ArticleInput,
				},
			});

			const newArticleId = result.data?.createArticle?._id;
			if (newArticleId) {
				if (onSuccess) {
					onSuccess(newArticleId);
				} else {
					router.push(`/community/${newArticleId}`);
				}
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		} finally {
			setSubmitting(false);
		}
	};

	const categoryOptions = [
		{ value: 'FREE', label: 'Free' },
		{ value: 'RECOMMEND', label: 'Recommend' },
		{ value: 'NEWS', label: 'News' },
		{ value: 'HUMOR', label: 'Humor' },
	];

	return (
		<div className="fixora-article-editor">
			<div className="fixora-article-editor__form">
				{/* Title */}
				<div className="fixora-article-editor__field">
					<FixoraInput
						value={title}
						onChange={(e: any) => setTitle(e.target.value)}
						placeholder="Article title"
						className="fixora-article-editor__title-input"
					/>
				</div>

				{/* Category */}
				<div className="fixora-article-editor__field">
					<FixoraSelect
						value={category}
						onChange={(e: any) => setCategory(e.target.value)}
						options={categoryOptions}
						label="Category"
					/>
				</div>

				{/* Excerpt */}
				<div className="fixora-article-editor__field">
					<FixoraInput
						value={excerpt}
						onChange={(e: any) => setExcerpt(e.target.value)}
						placeholder="Brief summary (optional)"
						className="fixora-article-editor__excerpt-input"
					/>
				</div>

				{/* Editor (Toast UI) — placeholder ref, actual editor in Teditor.tsx */}
				<div className="fixora-article-editor__field">
					<div id="fixora-editor-root" />
				</div>

				{/* Submit */}
				<div className="fixora-article-editor__actions">
					<FixoraButton
						variant="primary"
						onClick={handleSubmit}
						disabled={submitting}
						fullWidth
					>
						{submitting ? 'Publishing...' : 'Publish'}
					</FixoraButton>
				</div>
			</div>
		</div>
	);
};

export default ArticleEditor;
