declare global {
	interface Window {
		google?: {
			accounts: {
				oauth2: {
					initCodeClient: (config: {
						client_id: string;
						scope: string;
						ux_mode?: 'popup' | 'redirect';
						redirect_uri?: string;
						callback: (response: { code?: string; error?: string }) => void;
						error_callback?: (error: { type?: string; message?: string }) => void;
					}) => { requestCode: () => void };
				};
			};
		};
		__fixoraGoogleCodeClient__?: { requestCode: () => void };
		__fixoraGoogleAuthInFlight__?: boolean;
	}
}

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GIS_SCRIPT_ID = 'google-gis-script';

let scriptReadyPromise: Promise<void> | null = null;
let scriptReadyResolvers: Array<() => void> = [];
let lastHandledAuthCode = '';
let cachedGoogleClientId: string | null = null;

function isGisReady(): boolean {
	return Boolean(window.google?.accounts?.oauth2);
}

function resolveScriptWaiters(): void {
	if (!isGisReady()) return;
	const waiters = scriptReadyResolvers;
	scriptReadyResolvers = [];
	waiters.forEach((resolve) => resolve());
}

export function loadGoogleGisScript(): Promise<void> {
	if (typeof window === 'undefined') return Promise.resolve();
	if (isGisReady()) return Promise.resolve();

	if (!scriptReadyPromise) {
		scriptReadyPromise = new Promise((resolve, reject) => {
			scriptReadyResolvers.push(resolve);

			const existing = document.getElementById(GIS_SCRIPT_ID);
			if (existing) {
				existing.addEventListener('load', () => resolveScriptWaiters(), { once: true });
				existing.addEventListener('error', () => reject(new Error('Google GIS script failed')), {
					once: true,
				});
			} else {
				const script = document.createElement('script');
				script.id = GIS_SCRIPT_ID;
				script.src = GIS_SCRIPT_SRC;
				script.async = true;
				script.defer = true;
				script.onload = () => resolveScriptWaiters();
				script.onerror = () => reject(new Error('Google GIS script failed'));
				document.head.appendChild(script);
			}

			window.setTimeout(() => {
				if (isGisReady()) {
					resolveScriptWaiters();
					return;
				}
				scriptReadyPromise = null;
				reject(new Error('Google Identity Services failed to load'));
			}, 15000);
		});
	}

	return scriptReadyPromise;
}

function getOrCreateCodeClient(clientId: string): { requestCode: () => void } {
	if (window.__fixoraGoogleCodeClient__ && cachedGoogleClientId !== clientId) {
		window.__fixoraGoogleCodeClient__ = undefined;
		lastHandledAuthCode = '';
	}

	const existing = window.__fixoraGoogleCodeClient__;
	if (existing) return existing;

	cachedGoogleClientId = clientId;

	const oauth2 = window.google?.accounts?.oauth2;
	if (!oauth2) throw new Error('Google Identity Services not available');

	const client = oauth2.initCodeClient({
		client_id: clientId,
		scope: 'openid email profile',
		ux_mode: 'popup',
		redirect_uri: 'postmessage',
		callback: (response) => {
			window.__fixoraGoogleAuthInFlight__ = false;
			if (response.error || !response.code) {
				const code = (response.error || '').toLowerCase();
				if (code === 'access_denied' || code === 'popup_closed_by_user') {
					pendingReject?.(new Error('Google sign-in cancelled'));
				} else if (code) {
					pendingReject?.(new Error(`Google sign-in failed: ${response.error}`));
				} else {
					pendingReject?.(new Error('Google sign-in cancelled'));
				}
				clearPending();
				return;
			}
			if (response.code === lastHandledAuthCode) return;
			lastHandledAuthCode = response.code;
			pendingResolve?.(response.code);
			clearPending();
		},
		error_callback: (error) => {
			window.__fixoraGoogleAuthInFlight__ = false;
			const type = (error?.type || '').toLowerCase();
			if (type === 'popup_failed_to_open') {
				pendingReject?.(new Error('Google sign-in popup blocked'));
			} else if (type === 'popup_closed') {
				// Often: user closed popup, OR Google rejected the origin and closed it.
				pendingReject?.(
					new Error(
						'Google sign-in popup closed — check Authorized JavaScript origins for this site URL',
					),
				);
			} else if (error?.message) {
				pendingReject?.(new Error(`Google sign-in failed: ${error.message}`));
			} else {
				pendingReject?.(new Error('Google sign-in cancelled'));
			}
			clearPending();
		},
	});

	window.__fixoraGoogleCodeClient__ = client;
	return client;
}

let pendingResolve: ((code: string) => void) | null = null;
let pendingReject: ((err: Error) => void) | null = null;

function clearPending() {
	pendingResolve = null;
	pendingReject = null;
}

export async function requestGoogleAuthCode(clientId: string): Promise<string> {
	if (window.__fixoraGoogleAuthInFlight__) {
		throw new Error('Google sign-in already in progress');
	}

	await loadGoogleGisScript();

	return new Promise((resolve, reject) => {
		pendingResolve = resolve;
		pendingReject = reject;
		window.__fixoraGoogleAuthInFlight__ = true;

		try {
			getOrCreateCodeClient(clientId).requestCode();
		} catch (err) {
			window.__fixoraGoogleAuthInFlight__ = false;
			clearPending();
			reject(err instanceof Error ? err : new Error('Google sign-in could not start'));
		}
	});
}

export {};
