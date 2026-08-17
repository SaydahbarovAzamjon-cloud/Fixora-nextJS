import axios from 'axios';
import { getGraphqlUrl } from '../env/publicEnv';

/** Backend `allowedUploadTargets` — profile photos use `member` only. */
const DEFAULT_TARGETS = ['member'] as const;

function normalizeUploadPath(path: string): string {
	return path.startsWith('http') ? path : path.replace(/^\//, '');
}

function safeUploadFileName(file: File): string {
	const raw = file.name || 'photo.jpg';
	const extMatch = /\.([a-zA-Z0-9]+)$/.exec(raw);
	const ext = (extMatch?.[1] || 'jpg').toLowerCase();
	const safeExt = ['png', 'jpg', 'jpeg'].includes(ext) ? ext : 'jpg';
	return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
}

export async function uploadImageFile(
	file: File,
	token: string,
	targets: readonly string[] = DEFAULT_TARGETS,
): Promise<string> {
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
			// Rename so backend path has a safe unique filename (multipart File name).
			formData.append('0', file, safeUploadFileName(file));

			const response = await axios.post(getGraphqlUrl(), formData, {
				headers: {
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.data?.errors?.length) throw response.data;
			const path: string | undefined = response.data?.data?.imageUploader;
			if (!path) throw new Error('Upload failed');
			return normalizeUploadPath(path);
		} catch (err) {
			lastError = err;
		}
	}
	throw lastError ?? new Error('Upload failed');
}
