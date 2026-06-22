import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { getJwtToken } from '../auth';
import { REACT_APP_API_URL } from '../config';
import { sweetMixinErrorAlert } from '../sweetAlert';
import { resolveArticleImageUrl } from '../utils/articleImage';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/pjpeg'];
const ACCEPTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export function validateCoverFile(file: File): string | null {
	const type = file.type.toLowerCase();
	const name = file.name.toLowerCase();
	const typeOk =
		(type && ACCEPTED_TYPES.includes(type)) ||
		ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
	if (!typeOk) {
		return 'invalidType';
	}
	if (file.size > MAX_BYTES) {
		return 'tooLarge';
	}
	return null;
}

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export interface CoverFileState {
	file: File;
	previewUrl: string;
}

export function useArticleCoverUpload(onError?: (key: string) => void) {
	const [cover, setCover] = useState<CoverFileState | null>(null);
	const [remoteUrl, setRemoteUrl] = useState<string | null>(null);
	const [existingPath, setExistingPath] = useState<string | null>(null);
	const [dragging, setDragging] = useState(false);
	const [uploading, setUploading] = useState(false);
	const fileRef = useRef<HTMLInputElement>(null);

	const previewUrl = cover?.previewUrl ?? remoteUrl;

	useEffect(() => {
		return () => {
			if (cover?.previewUrl) {
				URL.revokeObjectURL(cover.previewUrl);
			}
		};
	}, [cover?.previewUrl]);

	const setExistingImage = useCallback((path?: string | null) => {
		setExistingPath(path ?? null);
		setRemoteUrl(path ? resolveArticleImageUrl(path) : null);
	}, []);

	const clearCover = useCallback(() => {
		setCover((prev) => {
			if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
			return null;
		});
		setRemoteUrl(null);
		setExistingPath(null);
	}, []);

	const applyFile = useCallback(
		(file: File) => {
			const err = validateCoverFile(file);
			if (err) {
				onError?.(err);
				return false;
			}
			setRemoteUrl(null);
			setExistingPath(null);
			setCover((prev) => {
				if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
				return { file, previewUrl: URL.createObjectURL(file) };
			});
			return true;
		},
		[onError],
	);

	const pickFile = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			e.target.value = '';
			if (file) applyFile(file);
		},
		[applyFile],
	);

	const onDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setDragging(false);
			const file = e.dataTransfer.files[0];
			if (file) applyFile(file);
		},
		[applyFile],
	);

	const uploadCover = useCallback(async (): Promise<string | undefined> => {
		if (!cover?.file) return existingPath ?? undefined;
		const token = getJwtToken();
		const formData = new FormData();
		formData.append(
			'operations',
			JSON.stringify({
				query: `mutation ImageUploader($file: Upload!, $target: String!) {
					imageUploader(file: $file, target: $target)
				}`,
				variables: { file: null, target: 'article' },
			}),
		);
		formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
		formData.append('0', cover.file);

		setUploading(true);
		try {
			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});
			if (response.data?.errors?.length) throw response.data;
			const path: string | undefined = response.data?.data?.imageUploader;
			if (!path) throw new Error('Upload failed');
			return path.startsWith('http') ? path : path.replace(/^\//, '');
		} finally {
			setUploading(false);
		}
	}, [cover?.file, existingPath]);

	return {
		cover,
		previewUrl,
		dragging,
		setDragging,
		fileRef,
		pickFile,
		onDrop,
		clearCover,
		applyFile,
		uploadCover,
		uploading,
		setExistingImage,
		openPicker: () => fileRef.current?.click(),
		hasImage: !!(cover || remoteUrl),
	};
}
