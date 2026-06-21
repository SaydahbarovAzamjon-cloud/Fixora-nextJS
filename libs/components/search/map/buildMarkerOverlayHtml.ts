import { escapeHtml } from './buildMapTooltipHtml';

export interface MarkerOverlayContent {
	name: string;
	shopName?: string;
	ratingLabel: string;
	reviewLabel: string;
	avatarUrl: string;
}

export function buildMarkerOverlayHtml(content: MarkerOverlayContent): string {
	const shopLine = content.shopName
		? `<span class="fixora-map-marker-popover__shop">${escapeHtml(content.shopName)}</span>`
		: '';

	return `<div class="fixora-map-marker-popover">
		<img class="fixora-map-marker-popover__avatar" src="${escapeHtml(content.avatarUrl)}" alt="" />
		<div class="fixora-map-marker-popover__body">
			<strong>${escapeHtml(content.name)}</strong>
			${shopLine}
			<span class="fixora-map-marker-popover__rating">${escapeHtml(content.ratingLabel)} · ${escapeHtml(content.reviewLabel)}</span>
		</div>
	</div>`;
}
