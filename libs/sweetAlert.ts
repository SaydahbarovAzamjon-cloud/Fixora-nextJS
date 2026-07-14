import Swal from 'sweetalert2';
import 'animate.css';
import { Messages } from './config';
import { toUserFacingErrorMessage } from './utils/oauthErrors';

const fixoraSwal = Swal.mixin({
	customClass: {
		popup: 'fixora-swal',
		title: 'fixora-swal__title',
		htmlContainer: 'fixora-swal__text',
		confirmButton: 'fixora-btn fixora-btn--primary fixora-swal__confirm',
		cancelButton: 'fixora-btn fixora-btn--outline fixora-swal__cancel',
	},
	buttonsStyling: false,
	background: 'transparent',
	color: '#FFFFFF',
	backdrop: 'rgba(0, 0, 0, 0.72)',
});

const fixoraToast = Swal.mixin({
	toast: true,
	position: 'top-end',
	showConfirmButton: false,
	customClass: {
		popup: 'fixora-swal-toast',
	},
	background: 'transparent',
	color: '#FFFFFF',
});

export const sweetErrorHandling = async (err: any) => {
	await fixoraSwal.fire({
		icon: 'error',
		text: toUserFacingErrorMessage(err),
		showConfirmButton: true,
		confirmButtonText: 'OK',
	});
};

export const sweetTopSuccessAlert = async (msg: string, duration: number = 2000) => {
	await fixoraSwal.fire({
		position: 'center',
		icon: 'success',
		title: msg.replace('Definer: ', ''),
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetContactAlert = async (msg: string, duration: number = 10000) => {
	await fixoraSwal.fire({
		title: msg,
		showClass: {
			popup: 'animate__bounceIn',
		},
		showConfirmButton: false,
		timer: duration,
	}).then();
};

export const sweetConfirmAlert = (msg: string) => {
	return new Promise(async (resolve) => {
		await fixoraSwal.fire({
			icon: 'question',
			text: msg,
			showClass: {
				popup: 'animate__bounceIn',
			},
			showCancelButton: true,
			showConfirmButton: true,
			confirmButtonText: 'OK',
			cancelButtonText: 'Cancel',
		}).then((response) => {
			resolve(response?.isConfirmed ?? false);
		});
	});
};

/** Confirm with custom title + button labels (i18n-friendly). */
export const sweetConfirmWithLabels = (opts: {
	title?: string;
	text: string;
	confirmButtonText: string;
	cancelButtonText: string;
}): Promise<boolean> => {
	return new Promise(async (resolve) => {
		await fixoraSwal
			.fire({
				icon: 'question',
				title: opts.title,
				text: opts.text,
				showClass: {
					popup: 'animate__bounceIn',
				},
				showCancelButton: true,
				showConfirmButton: true,
				confirmButtonText: opts.confirmButtonText,
				cancelButtonText: opts.cancelButtonText,
			})
			.then((response) => {
				resolve(response?.isConfirmed ?? false);
			});
	});
};

export const sweetLoginConfirmAlert = (msg: string) => {
	return new Promise(async (resolve) => {
		await fixoraSwal.fire({
			text: msg,
			showCancelButton: true,
			showConfirmButton: true,
			confirmButtonText: 'Login',
			cancelButtonText: 'Cancel',
		}).then((response) => {
			resolve(response?.isConfirmed ?? false);
		});
	});
};

export const sweetErrorAlert = async (msg: string, duration: number = 3000) => {
	await fixoraSwal.fire({
		icon: 'error',
		title: msg,
		showConfirmButton: true,
		confirmButtonText: 'OK',
		timer: duration,
		timerProgressBar: true,
	});
};

export const sweetMixinErrorAlert = async (msg: string, duration?: number) => {
	await fixoraSwal.fire({
		icon: 'error',
		title: msg,
		showConfirmButton: true,
		confirmButtonText: 'OK',
		...(duration ? { timer: duration, timerProgressBar: true } : {}),
	});
};

export const sweetMixinSuccessAlert = async (msg: string, duration: number = 2000) => {
	await fixoraSwal.fire({
		icon: 'success',
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetBasicAlert = async (text: string) => {
	fixoraSwal.fire(text);
};

export const sweetErrorHandlingForAdmin = async (err: any) => {
	await fixoraSwal.fire({
		icon: 'error',
		text: toUserFacingErrorMessage(err, Messages.error1),
		showConfirmButton: true,
		confirmButtonText: 'OK',
	});
};

export const sweetTopSmallSuccessAlert = async (
	msg: string,
	duration: number = 2000,
	enable_forward: boolean = false,
) => {
	await fixoraToast.fire({
		icon: 'success',
		title: msg,
		timer: duration,
		timerProgressBar: true,
	}).then((data) => {
		if (enable_forward) {
			window.location.reload();
		}
		return data;
	});
};
