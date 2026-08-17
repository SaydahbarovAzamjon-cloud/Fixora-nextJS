import { useCallback, useEffect, useRef, useState } from 'react';
import { profileImageDraftVar } from '../../apollo/store';
import { getJwtToken } from '../auth';
import { resolveProfileImageUrl } from '../utils/profileImage';
import { uploadImageFile } from '../utils/uploadImageFile';
import { formatFileSize } from './useArticleCoverUpload';

export { formatFileSize };

/** Backend `validMimeTypes`: png / jpg / jpeg only. */
const PROFILE_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/pjpeg'];
const PROFILE_ACCEPTED_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
const MAX_BYTES = 5 * 1024 * 1024;

function validateProfileFile(file: File): string | null {
	const type = file.type.toLowerCase();
	const name = file.name.toLowerCase();
	const typeOk =
		(type && PROFILE_ACCEPTED_TYPES.includes(type)) ||
		PROFILE_ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
	if (!typeOk) return 'invalidType';
	if (file.size > MAX_BYTES) return 'tooLarge';
	return null;
}

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
			const err = validateProfileFile(file);
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

	const uploadProfileImage = useCallback(async (): Promise<string | undefined> => {
		if (!cover?.file) return existingPath ?? undefined;
		const token = getJwtToken();
		if (!token) throw new Error('Not authenticated');

		setUploading(true);
		try {
			return await uploadImageFile(cover.file, token);
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
}
