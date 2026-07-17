import imageCompression from 'browser-image-compression';

/** Profile / document uploads — keep under typical nginx 1–10MB body limits. */
export async function compressUploadImage(
	file: File,
	options?: { maxSizeMB?: number; maxWidthOrHeight?: number },
): Promise<File> {
	if (!file.type.startsWith('image/')) return file;
	try {
		return await imageCompression(file, {
			maxSizeMB: options?.maxSizeMB ?? 0.8,
			maxWidthOrHeight: options?.maxWidthOrHeight ?? 1600,
			useWebWorker: true,
			initialQuality: 0.8,
			fileType: file.type === 'image/png' ? 'image/jpeg' : undefined,
		});
	} catch {
		return file;
	}
}
