import imageCompression from 'browser-image-compression';

/** Compress before uploadMessageImage to keep payloads small. */
export async function compressMessageImage(file: File): Promise<File> {
	try {
		return await imageCompression(file, {
			maxSizeMB: 0.4,
			maxWidthOrHeight: 1280,
			useWebWorker: true,
			initialQuality: 0.75,
		});
	} catch {
		return file;
	}
}

export async function fileToDataUrl(file: File): Promise<string> {
	const compressed = await compressMessageImage(file);
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(compressed);
	});
}
