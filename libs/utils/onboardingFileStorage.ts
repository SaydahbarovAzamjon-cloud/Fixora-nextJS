/** Convert a data URL back to a File (signup draft recovery when in-memory refs are lost). */
export function dataUrlToFile(dataUrl: string, fileName: string, fallbackMime = 'image/jpeg'): File {
	const [header, base64] = dataUrl.split(',');
	if (!base64) throw new Error('Invalid data URL');
	const mime = header.match(/:(.*?);/)?.[1] ?? fallbackMime;
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return new File([bytes], fileName, { type: mime });
}

/** Read a File as a data URL for sessionStorage draft persistence. */
export function readFileAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === 'string') resolve(reader.result);
			else reject(new Error('Failed to read file'));
		};
		reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
		reader.readAsDataURL(file);
	});
}
