import { validateEmail } from '../auth/fixoraAuth';

export interface EmailSaveDecision {
	nextEmail: string;
	currentEmail: string;
	/** Update only when the user entered a new non-empty email that differs from stored. */
	shouldUpdate: boolean;
	invalidFormat: boolean;
}

/**
 * Decide whether to call updateEmail for any technician settings save flow.
 * Empty form email with an existing stored email is NOT treated as a change.
 */
export function resolveTechnicianEmailSave(
	formEmail: string,
	storedEmail?: string | null,
): EmailSaveDecision {
	const nextEmail = formEmail.trim();
	const currentEmail = (storedEmail ?? '').trim().toLowerCase();
	const shouldUpdate = nextEmail.length > 0 && nextEmail.toLowerCase() !== currentEmail;
	const invalidFormat = shouldUpdate && !validateEmail(nextEmail);

	return { nextEmail, currentEmail, shouldUpdate, invalidFormat };
}
