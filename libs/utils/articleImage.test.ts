import { describe, expect, it } from 'vitest';
import {
	articleImageFallbackUrl,
	encodeUploadAssetPath,
	resolveArticleImageUrl,
} from './articleImage';
import { memberFallbackUploadPath } from './uploadAssetUrl';

describe('encodeUploadAssetPath', () => {
	it('encodes spaces in the filename only', () => {
		expect(encodeUploadAssetPath('uploads/article/Screenshot 2026-06-21 140524.png')).toBe(
			'uploads/article/Screenshot%202026-06-21%20140524.png',
		);
	});
});

describe('memberFallbackUploadPath', () => {
	it('rewrites article folder to member', () => {
		expect(memberFallbackUploadPath('uploads/article/IMG_6084.PNG')).toBe(
			'uploads/member/IMG_6084.PNG',
		);
	});
});

describe('resolveArticleImageUrl', () => {
	it('keeps absolute CDN URLs unchanged', () => {
		const url = 'https://images.unsplash.com/photo-123';
		expect(resolveArticleImageUrl(url)).toBe(url);
	});

	it('returns null for empty values', () => {
		expect(resolveArticleImageUrl(null)).toBeNull();
		expect(resolveArticleImageUrl('')).toBeNull();
	});

	it('encodes relative upload paths', () => {
		const resolved = resolveArticleImageUrl('uploads/article/IMG_6084.PNG');
		expect(resolved).toMatch(/uploads\/article\/IMG_6084\.PNG$/);
		expect(resolved).not.toContain('uploads/article/Screenshot');
	});

	it('encodes spaces in relative upload filenames', () => {
		const resolved = resolveArticleImageUrl('uploads/article/Screenshot 2026-06-21 140524.png');
		expect(resolved).toContain('Screenshot%202026-06-21%20140524.png');
		expect(resolved).not.toContain('Screenshot 2026');
	});

	it('points fallback at the member folder', () => {
		const fallback = articleImageFallbackUrl('uploads/article/IMG_6084.PNG');
		expect(fallback).toMatch(/uploads\/member\/IMG_6084\.PNG$/);
	});
});
