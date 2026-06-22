import { useCallback, useRef, useState } from 'react';
import axios from 'axios';
import { getJwtToken } from '../auth';
import { MAX_DEVICE_IMAGES } from '../utils/deviceImage';
import { validateCoverFile } from './useArticleCoverUpload';

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

function readFileAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
		reader.readAsDataURL(file);
	});
}

async function uploadDeviceFile(file: File): Promise<string> {
	const token = getJwtToken();
	if (!token) throw new Error('Not authenticated');

	const formData = new FormData();
	formData.append(
		'operations',
		JSON.stringify({
			query: `mutation ImageUploader($file: Upload!, $target: String!) {
				imageUploader(file: $file, target: $target)
			}`,
			variables: { file: null, target: 'device' },
		}),
	);
	formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
	formData.append('0', file);

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
}

export function useDeviceImageUpload(onError?: (key: string) => void, existingCount = 0) {
	const [images, setImages] = useState<DeviceImageState[]>([]);
	const [uploading, setUploading] = useState(false);
	const fileRef = useRef<HTMLInputElement>(null);
	const replaceTargetIdRef = useRef<string | null>(null);
	const existingCountRef = useRef(existingCount);
	existingCountRef.current = Math.max(0, existingCount);

	const applyFileToImage = useCallback(
		async (file: File): Promise<DeviceImageState | null> => {
			const err = validateCoverFile(file);
			if (err) {
				onError?.(err);
				return null;
			}
			try {
				const previewUrl = await readFileAsDataUrl(file);
				return {
					id: nextDeviceImageId(),
					file,
					previewUrl,
				};
			} catch {
				onError?.('generic');
				return null;
			}
		},
		[onError],
	);

	const addFiles = useCallback(
		async (files: FileList | File[]) => {
			const list = Array.from(files);
			if (list.length === 0) return;

			const pending: DeviceImageState[] = [];
			for (const file of list) {
				const next = await applyFileToImage(file);
				if (next) pending.push(next);
			}

			if (pending.length === 0) return;

			setImages((prev) => {
				const remaining = MAX_DEVICE_IMAGES - existingCountRef.current - prev.length;
				if (remaining <= 0) {
					queueMicrotask(() => onError?.('tooMany'));
					return prev;
				}

				const toAdd = pending.slice(0, remaining);
				const overflow = pending.slice(remaining);

				if (overflow.length > 0 || pending.length > remaining) {
					queueMicrotask(() => onError?.('tooMany'));
				}

				return [...prev, ...toAdd];
			});
		},
		[applyFileToImage, onError],
	);

	const replaceImage = useCallback(
		async (id: string, file: File) => {
			const err = validateCoverFile(file);
			if (err) {
				onError?.(err);
				return;
			}
			try {
				const previewUrl = await readFileAsDataUrl(file);
				setImages((prev) =>
					prev.map((image) => (image.id === id ? { ...image, file, previewUrl } : image)),
				);
			} catch {
				onError?.('generic');
			}
		},
		[onError],
	);

	const pickFiles = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files;
			const replaceId = replaceTargetIdRef.current;
			replaceTargetIdRef.current = null;
			e.target.value = '';
			if (!files?.length) return;
			if (replaceId) {
				void replaceImage(replaceId, files[0]);
				return;
			}
			void addFiles(files);
		},
		[addFiles, replaceImage],
	);

	const removeImage = useCallback((id: string) => {
		setImages((prev) => prev.filter((image) => image.id !== id));
	}, []);

	const clearImages = useCallback(() => {
		setImages([]);
	}, []);

	const uploadDeviceImages = useCallback(async (): Promise<string[]> => {
		if (images.length === 0) return [];
		setUploading(true);
		try {
			const paths: string[] = [];
			for (const image of images) {
				paths.push(await uploadDeviceFile(image.file));
			}
			return paths;
		} finally {
			setUploading(false);
		}
	}, [images]);

	const safeExistingCount = Math.max(0, existingCount);
	const totalCount = safeExistingCount + images.length;
	const remainingSlots = Math.max(0, MAX_DEVICE_IMAGES - totalCount);

	return {
		images,
		maxImages: MAX_DEVICE_IMAGES,
		fileRef,
		pickFiles,
		removeImage,
		clearImages,
		uploadDeviceImages,
		uploading,
		openPicker: () => {
			replaceTargetIdRef.current = null;
			fileRef.current?.click();
		},
		openReplacePicker: (id: string) => {
			replaceTargetIdRef.current = id;
			fileRef.current?.click();
		},
		hasImages: images.length > 0,
		canAddMore: totalCount < MAX_DEVICE_IMAGES,
		remainingSlots,
		totalCount,
	};
}
