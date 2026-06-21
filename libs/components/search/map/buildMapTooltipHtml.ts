/** Escapes text for safe HTML injection in Kakao CustomOverlay tooltips. */
export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function buildMapTooltipHtml(name: string, ratingLabel: string): string {
	return `<div class="fixora-map-tooltip">
		<strong>${escapeHtml(name)}</strong>
		<span>${escapeHtml(ratingLabel)}</span>
	</div>`;
}
