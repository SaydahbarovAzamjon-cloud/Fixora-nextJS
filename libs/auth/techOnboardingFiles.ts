/** In-memory file refs for technician onboarding (cannot JSON-serialize File to sessionStorage). */

let photoFile: File | null = null;
let idFile: File | null = null;

export function setTechPhotoFile(file: File | null) {
	photoFile = file;
}

export function getTechPhotoFile(): File | null {
	return photoFile;
}

export function setTechIdFile(file: File | null) {
	idFile = file;
}

export function getTechIdFile(): File | null {
	return idFile;
}

export function clearTechOnboardingFiles() {
	photoFile = null;
	idFile = null;
}
