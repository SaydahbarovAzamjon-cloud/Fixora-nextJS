import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { profileImageDraftVar } from '../../apollo/store';
import { getJwtToken } from '../auth';
import { resolveProfileImageUrl } from '../utils/profileImage';
import { getGraphqlUrl } from '../env/publicEnv';
import { formatFileSize, validateCoverFile } from './useArticleCoverUpload';

export { formatFileSize };

export interface ProfileFileState {
	file: File;
	previewUrl: string;
}

const UPLOAD_TARGETS = ['user', 'member'] as const;

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
		if (!cover?.file) {
			profileImageDraftVar(null);
		}
	}, [cover?.file]);

	const clearCover = useCallback(() => {
		setCover((prev) => {
			if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
			return null;
		});
		setRemoteUrl(null);
		setExistingPath(null);
		profileImageDraftVar(null);
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
				const previewUrl = URL.createObjectURL(file);
				profileImageDraftVar(previewUrl);
				return { file, previewUrl };
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

	const uploadWithTarget = async (file: File, target: string, token: string): Promise<string> => {
		const formData = new FormData();
		formData.append(
			'operations',
			JSON.stringify({
				query: `mutation ImageUploader($file: Upload!, $target: String!) {
					imageUploader(file: $file, target: $target)
				}`,
				variables: { file: null, target },
			}),
		);
		formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
		formData.append('0', file);

		const response = await axios.post(getGraphqlUrl(), formData, {
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
	};

	const uploadProfileImage = useCallback(async (): Promise<string | undefined> => {
		if (!cover?.file) return existingPath ?? undefined;
		const token = getJwtToken();
		if (!token) throw new Error('Not authenticated');

		setUploading(true);
		try {
			let lastErr: unknown;
			for (const target of UPLOAD_TARGETS) {
				try {
					return await uploadWithTarget(cover.file, target, token);
				} catch (err) {
					lastErr = err;
				}
			}
			throw lastErr ?? new Error('Upload failed');
		} finally {
			setUploading(false);
		}
	}, [cover?.file, existingPath]);

	const clearDraftAfterSave = useCallback((savedPath?: string | null) => {
		setCover((prev) => {
			if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
			return null;
		});
		profileImageDraftVar(null);
		if (savedPath) {
			setExistingPath(savedPath);
			setRemoteUrl(resolveProfileImageUrl(savedPath));
		}
	}, []);

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
		clearDraftAfterSave,
		openPicker: () => fileRef.current?.click(),
		hasImage: !!(cover || remoteUrl),
	};
};
