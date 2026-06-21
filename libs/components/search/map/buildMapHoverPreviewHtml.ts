import { escapeHtml } from './buildMapTooltipHtml';

export interface MapHoverPreviewContent {
	name: string;
	shopName?: string;
	ratingLabel: string;
	reviewLabel: string;
	avatarUrl: string;
}

export function buildMapHoverPreviewHtml(content: MapHoverPreviewContent): string {
	const shopLine = content.shopName
		? `<p class="fixora-map-hover-preview__shop">${escapeHtml(content.shopName)}</p>`
		: '';

	return `<div class="fixora-map-hover-preview" role="tooltip">
		<div class="fixora-map-hover-preview__header">
			<img class="fixora-map-hover-preview__avatar" src="${escapeHtml(content.avatarUrl)}" alt="" />
			<div class="fixora-map-hover-preview__titles">
				<strong class="fixora-map-hover-preview__name">${escapeHtml(content.name)}</strong>
				${shopLine}
				<div class="fixora-map-hover-preview__rating">
					<span class="fixora-map-hover-preview__rating-value">${escapeHtml(content.ratingLabel)}</span>
					<span class="fixora-map-hover-preview__reviews">${escapeHtml(content.reviewLabel)}</span>
				</div>
			</div>
		</div>
	</div>`;
}
