import axios from 'axios';
import { getGraphqlUrl } from '../env/publicEnv';
import { compressUploadImage } from './compressUploadImage';

const DEFAULT_TARGETS = ['user', 'member'] as const;

function normalizeUploadPath(path: string): string {
	return path.startsWith('http') ? path : path.replace(/^\//, '');
}

function isPayloadTooLarge(err: unknown): boolean {
	const anyErr = err as {
		response?: { status?: number };
		message?: string;
		status?: number;
	};
	const status = anyErr?.response?.status ?? anyErr?.status;
	if (status === 413) return true;
	const message = String(anyErr?.message ?? '');
	return /413|payload too large|request entity too large/i.test(message);
}

export async function uploadImageFile(
	file: File,
	token: string,
	targets: readonly string[] = DEFAULT_TARGETS,
): Promise<string> {
	const uploadFile = await compressUploadImage(file);
	let lastError: unknown;
	for (const target of targets) {
		try {
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
			formData.append('0', uploadFile);

			const response = await axios.post(getGraphqlUrl(), formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
				maxContentLength: 12 * 1024 * 1024,
				maxBodyLength: 12 * 1024 * 1024,
			});

			if (response.data?.errors?.length) throw response.data;
			const path: string | undefined = response.data?.data?.imageUploader;
			if (!path) throw new Error('Upload failed');
			return normalizeUploadPath(path);
		} catch (err) {
			if (isPayloadTooLarge(err)) {
				throw new Error('PHOTO_TOO_LARGE');
			}
			lastError = err;
		}
	}
	if (isPayloadTooLarge(lastError)) {
		throw new Error('PHOTO_TOO_LARGE');
	}
	throw lastError ?? new Error('Upload failed');
}
