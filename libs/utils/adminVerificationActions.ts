import type { TFunction } from 'next-i18next';
import type { AdminUser, VerificationStatus } from '../types/admin/admin';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../sweetAlert';

export function getGraphQLErrorMessage(err: unknown): string {
	const anyErr = err as {
		graphQLErrors?: { message?: string }[];
		message?: string;
	};
	if (anyErr?.graphQLErrors?.[0]?.message) return anyErr.graphQLErrors[0].message;
	return anyErr?.message ?? 'Unknown error';
}

export function isPendingVerificationActionError(err: unknown): boolean {
	const msg = getGraphQLErrorMessage(err);
	return /cannot be submitted|current status/i.test(msg);
}

export function verificationActionErrorMessage(
	err: unknown,
	status: VerificationStatus | undefined,
	t: TFunction,
): string {
	if (status === 'PENDING' && isPendingVerificationActionError(err)) {
		return t('verification.errors.pendingActionBlocked');
	}
	return getGraphQLErrorMessage(err);
}

export async function runAdminVerificationApprove(options: {
	user: Pick<AdminUser, '_id' | 'verificationStatus'>;
	approve: (vars: { userId: string }) => Promise<unknown>;
	t: TFunction;
	onSuccess?: () => void | Promise<void>;
}): Promise<void> {
	const { user, approve, t, onSuccess } = options;
	try {
		await approve({ userId: user._id });
		await sweetTopSmallSuccessAlert(t('common.success'), 1200);
		await onSuccess?.();
	} catch (err) {
		const message = verificationActionErrorMessage(err, user.verificationStatus, t);
		await sweetErrorHandling({ message });
	}
}

export async function runAdminVerificationReject(options: {
	user: Pick<AdminUser, '_id' | 'verificationStatus'>;
	reject: (vars: { userId: string; reason?: string }) => Promise<unknown>;
	reason?: string;
	t: TFunction;
	onSuccess?: () => void | Promise<void>;
}): Promise<void> {
	const { user, reject, reason, t, onSuccess } = options;
	try {
		await reject({ userId: user._id, reason: reason || undefined });
		await sweetTopSmallSuccessAlert(t('common.success'), 1200);
		await onSuccess?.();
	} catch (err) {
		const message = verificationActionErrorMessage(err, user.verificationStatus, t);
		await sweetErrorHandling({ message });
	}
}
