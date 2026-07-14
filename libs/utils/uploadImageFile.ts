import axios from 'axios';
import { getGraphqlUrl } from '../env/publicEnv';

const DEFAULT_TARGETS = ['user', 'member'] as const;

function normalizeUploadPath(path: string): string {
	return path.startsWith('http') ? path : path.replace(/^\//, '');
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
			return normalizeUploadPath(path);
		} catch (err) {
			lastError = err;
		}
	}
	throw lastError ?? new Error('Upload failed');
}
