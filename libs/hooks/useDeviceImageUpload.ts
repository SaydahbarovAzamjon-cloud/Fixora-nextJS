import { useCallback, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { getJwtToken } from '../auth/tokens';
import { MAX_DEVICE_IMAGES } from '../utils/deviceImage';

const GRAPHQL_URI =
	process.env.REACT_APP_API_GRAPHQL_URL ||
	process.env.NEXT_PUBLIC_GRAPHQL_URL ||
	'http://localhost:2000/graphql';
import { validateCoverFile } from './useArticleCoverUpload';

/** FixoraB allowedUploadTargets — `device` whitelisted (GAP-112). */
const UPLOAD_TARGETS = ['device', 'property', 'article'] as const;

export interface DeviceImageState {
	id: string;
	file: File;
	previewUrl: string;
}

let deviceImageId = 0;

function nextDeviceImageId() {
	deviceImageId += 1;
	return `device-image-${deviceImageId}`;
}

function revokePreviewUrl(url: string) {
	if (url.startsWith('blob:')) URL.revokeObjectURL(url);
}

function uploadErrorMessage(err: unknown): string {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const anyErr = err as any;
	return (
		anyErr?.errors?.[0]?.message ||
		anyErr?.response?.data?.errors?.[0]?.message ||
		anyErr?.message ||
		'Upload failed'
	);
}

async function uploadDeviceFileWithTarget(file: File, target: string, token: string): Promise<string> {
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

	const response = await axios.post(GRAPHQL_URI, formData, {
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
}

/** Same multipart pattern as useArticleCoverUpload — imageUploader (singular). */
async function uploadDeviceFile(file: File, token: string): Promise<string> {
	let lastError: unknown;
	for (const target of UPLOAD_TARGETS) {
		try {
			return await uploadDeviceFileWithTarget(file, target, token);
		} catch (err) {
			lastError = err;
		}
	}
	throw lastError;
}

export function useDeviceImageUpload(onError?: (key: string) => void, existingCount = 0) {
	const [images, setImages] = useState<DeviceImageState[]>([]);
	const [uploading, setUploading] = useState(false);
	const fileRef = useRef<HTMLInputElement>(null);
	const replaceTargetIdRef = useRef<string | null>(null);
	const existingCountRef = useRef(existingCount);
	existingCountRef.current = Math.max(0, existingCount);

	const addFiles = useCallback(
		(files: FileList | File[]) => {
			const list = Array.from(files);
			if (list.length === 0) return;

			setImages((prev) => {
				const remaining = MAX_DEVICE_IMAGES - existingCountRef.current - prev.length;
				if (remaining <= 0) {
					queueMicrotask(() => onError?.('tooMany'));
					return prev;
				}

				const pending: DeviceImageState[] = [];
				for (const file of list) {
					if (pending.length >= remaining) break;

					const err = validateCoverFile(file);
					if (err) {
						queueMicrotask(() => onError?.(err));
						continue;
					}

					pending.push({
						id: nextDeviceImageId(),
						file,
						previewUrl: URL.createObjectURL(file),
					});
				}

				if (pending.length === 0) return prev;

				if (list.length > remaining) {
					queueMicrotask(() => onError?.('tooMany'));
				}

				return [...prev, ...pending];
			});
		},
		[onError],
	);

	const replaceImage = useCallback(
		(id: string, file: File) => {
			const err = validateCoverFile(file);
			if (err) {
				onError?.(err);
				return;
			}

			const previewUrl = URL.createObjectURL(file);
			setImages((prev) =>
				prev.map((image) => {
					if (image.id !== id) return image;
					revokePreviewUrl(image.previewUrl);
					return { ...image, file, previewUrl };
				}),
			);
		},
		[onError],
	);

	const pickFiles = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files ? Array.from(e.target.files) : [];
			const replaceId = replaceTargetIdRef.current;
			replaceTargetIdRef.current = null;
			e.target.value = '';

			if (!files.length) return;

			if (replaceId) {
				replaceImage(replaceId, files[0]);
				return;
			}

			addFiles(files);
		},
		[addFiles, replaceImage],
	);

	const removeImage = useCallback((id: string) => {
		setImages((prev) => {
			const target = prev.find((image) => image.id === id);
			if (target) revokePreviewUrl(target.previewUrl);
			return prev.filter((image) => image.id !== id);
		});
	}, []);

	const clearImages = useCallback(() => {
		setImages((prev) => {
			prev.forEach((image) => revokePreviewUrl(image.previewUrl));
			return [];
		});
	}, []);

	const uploadDeviceImages = useCallback(async (): Promise<string[]> => {
		if (images.length === 0) return [];

		const token = getJwtToken();
		if (!token) throw new Error('Not authenticated');

		setUploading(true);
		try {
			const paths: string[] = [];
			for (const image of images) {
				paths.push(await uploadDeviceFile(image.file, token));
			}
			return paths;
		} catch (err) {
			throw new Error(uploadErrorMessage(err));
		} finally {
			setUploading(false);
		}
	}, [images]);

	const safeExistingCount = Math.max(0, existingCount);
	const totalCount = safeExistingCount + images.length;
	const remainingSlots = Math.max(0, MAX_DEVICE_IMAGES - totalCount);

	const openPicker = useCallback(() => {
		replaceTargetIdRef.current = null;
		fileRef.current?.click();
	}, []);

	const openReplacePicker = useCallback((id: string) => {
		replaceTargetIdRef.current = id;
		fileRef.current?.click();
	}, []);

	return useMemo(
		() => ({
			images,
			maxImages: MAX_DEVICE_IMAGES,
			fileRef,
			pickFiles,
			removeImage,
			clearImages,
			uploadDeviceImages,
			uploading,
			openPicker,
			openReplacePicker,
			hasImages: images.length > 0,
			canAddMore: totalCount < MAX_DEVICE_IMAGES,
			remainingSlots,
			totalCount,
		}),
		[
			images,
			pickFiles,
			removeImage,
			clearImages,
			uploadDeviceImages,
			uploading,
			openPicker,
			openReplacePicker,
			totalCount,
			remainingSlots,
		],
	);
}
