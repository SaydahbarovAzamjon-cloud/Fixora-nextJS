import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { getJwtToken } from '../auth';
import { resolveProfileImageUrl } from '../utils/profileImage';
import { formatFileSize, validateCoverFile } from './useArticleCoverUpload';

export { formatFileSize };

export interface ProfileFileState {
	file: File;
	previewUrl: string;
}

export function useProfileImageUpload(onError?: (key: string) => void) {
	const [cover, setCover] = useState<ProfileFileState | null>(null);
	const [remoteUrl, setRemoteUrl] = useState<string | null>(null);
	const [existingPath, setExistingPath] = useState<string | null>(null);
	const [dragging, setDragging] = useState(false);
	const [uploading, setUploading] = useState(false);
	const fileRef = useRef<HTMLInputElement>(null);

	const previewUrl = cover?.previewUrl ?? remoteUrl;
	const fileName = cover?.file.name ?? null;

	useEffect(() => {
		return () => {
			if (cover?.previewUrl) URL.revokeObjectURL(cover.previewUrl);
		};
	}, [cover?.previewUrl]);

	const setExistingImage = useCallback((path?: string | null) => {
		setExistingPath(path ?? null);
		setRemoteUrl(path ? resolveProfileImageUrl(path) : null);
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

	const uploadProfileImage = useCallback(async (): Promise<string | undefined> => {
		if (!cover?.file) return existingPath ?? undefined;
		const token = getJwtToken();
		const formData = new FormData();
		formData.append(
			'operations',
			JSON.stringify({
				query: `mutation ImageUploader($file: Upload!, $target: String!) {
					imageUploader(file: $file, target: $target)
				}`,
				variables: { file: null, target: 'user' },
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
		fileName,
		dragging,
		setDragging,
		fileRef,
		pickFile,
		onDrop,
		clearCover,
		applyFile,
		uploadProfileImage,
		uploading,
		setExistingImage,
		openPicker: () => fileRef.current?.click(),
		hasImage: !!(cover || remoteUrl),
	};
}
