/** Legacy default body saved as real content before placeholder overlay. */
export function isLegacyArticleTemplate(content: string): boolean {
	const trimmed = content.trim();
	if (!trimmed) return false;

	const enIntro =
		trimmed.startsWith('## Intro') || trimmed.startsWith('## Introduction');
	const krIntro = trimmed.startsWith('## 소개');
	const hasEnSections =
		trimmed.includes('### Common Causes') && trimmed.includes('### Step-by-Step Solution');
	const hasKrSections =
		trimmed.includes('### 일반적인 원인') && trimmed.includes('### 단계별 해결 방법');

	return (enIntro && hasEnSections) || (krIntro && hasKrSections);
}
