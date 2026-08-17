import { useEffect, useState } from 'react';
import { articleImageFallbackUrl, resolveArticleImageUrl } from '../utils/articleImage';

/** Primary cover URL, then member-folder fallback, then hide. */
export function useArticleCoverSrc(articleImage?: string | null) {
	const primary = resolveArticleImageUrl(articleImage);
	const fallback = articleImageFallbackUrl(articleImage);
	const [stage, setStage] = useState<'primary' | 'fallback' | 'failed'>('primary');

	useEffect(() => {
		setStage('primary');
	}, [primary, fallback]);

	const src = stage === 'fallback' ? fallback : primary;
	const show = stage !== 'failed' && !!src;

	const onError = () => {
		if (stage === 'primary' && fallback && fallback !== primary) {
			setStage('fallback');
			return;
		}
		setStage('failed');
	};

	return { src: src ?? undefined, show, onError };
}
