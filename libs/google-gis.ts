declare global {
	interface Window {
		google?: {
			accounts: {
				id: {
					initialize: (config: {
						client_id: string;
						callback: (response: { credential?: string; select_by?: string }) => void;
						auto_select?: boolean;
						cancel_on_tap_outside?: boolean;
						context?: 'signin' | 'signup' | 'use';
						itp_support?: boolean;
						use_fedcm_for_prompt?: boolean;
					}) => void;
					prompt: (momentListener?: (notification: {
						isNotDisplayed: () => boolean;
						isSkippedMoment: () => boolean;
						isDismissedMoment: () => boolean;
						getNotDisplayedReason?: () => string;
						getSkippedReason?: () => string;
						getDismissedReason?: () => string;
					}) => void) => void;
					renderButton: (
						parent: HTMLElement,
						options: {
							type?: 'standard' | 'icon';
							theme?: 'outline' | 'filled_blue' | 'filled_black';
							size?: 'large' | 'medium' | 'small';
							text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
							shape?: 'rectangular' | 'pill' | 'circle' | 'square';
							logo_alignment?: 'left' | 'center';
							width?: number;
						},
					) => void;
					cancel: () => void;
				};
				oauth2: {
					initCodeClient: (config: {
						client_id: string;
						scope: string;
						ux_mode?: 'popup' | 'redirect';
						redirect_uri?: string;
						state?: string;
						callback?: (response: { code?: string; error?: string }) => void;
						error_callback?: (error: { type?: string; message?: string }) => void;
					}) => { requestCode: () => void };
				};
			};
		};
		__fixoraGoogleCodeClient__?: { requestCode: () => void; mode?: GoogleAuthUxMode };
		__fixoraGoogleAuthInFlight__?: boolean;
	}
}

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GIS_SCRIPT_ID = 'google-gis-script';
<<<<<<< HEAD
const GOOGLE_OAUTH_PENDING_KEY = 'fixora_google_oauth_pending';
const GOOGLE_OAUTH_CALLBACK_PATH = '/oauth/google';

export type GoogleAuthUxMode = 'popup' | 'redirect';
export type GoogleOAuthMode = 'login' | 'register';

export interface GoogleOAuthPending {
	mode: GoogleOAuthMode;
	returnTo: string;
	createdAt: number;
}

export type GoogleAuthStartResult =
	| { type: 'code'; code: string }
	| { type: 'redirect' };
=======
const POPUP_CLOSED_GRACE_MS = 750;
>>>>>>> origin/cursor/fix-google-oauth-cancel-73f3

let scriptReadyPromise: Promise<void> | null = null;
let scriptReadyResolvers: Array<() => void> = [];
let lastHandledAuthCode = '';
let cachedGoogleClientId: string | null = null;
<<<<<<< HEAD
let cachedUxMode: GoogleAuthUxMode | null = null;
=======
let popupClosedTimer: ReturnType<typeof setTimeout> | null = null;
>>>>>>> origin/cursor/fix-google-oauth-cancel-73f3

function isGisReady(): boolean {
	return Boolean(window.google?.accounts?.oauth2 && window.google?.accounts?.id);
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

<<<<<<< HEAD
/** Real phones / in-app browsers — popup + postmessage is unreliable here. */
export function prefersGoogleRedirectFlow(): boolean {
	if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
	const ua = navigator.userAgent || '';
	if (/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return true;
	if (/Mobile|Mobile Safari|CriOS|FxiOS/i.test(ua) && /Safari|Chrome|Firefox/i.test(ua)) return true;
	if (/KAKAOTALK|Instagram|FBAN|FBAV|Line\/|NAVER|SamsungBrowser/i.test(ua)) return true;
	return false;
}

export function getGoogleOAuthRedirectUri(): string {
	if (typeof window === 'undefined') return GOOGLE_OAUTH_CALLBACK_PATH;
	return `${window.location.origin}${GOOGLE_OAUTH_CALLBACK_PATH}`;
}

export function saveGoogleOAuthPending(pending: Omit<GoogleOAuthPending, 'createdAt'>): void {
	if (typeof window === 'undefined') return;
	const payload: GoogleOAuthPending = { ...pending, createdAt: Date.now() };
	sessionStorage.setItem(GOOGLE_OAUTH_PENDING_KEY, JSON.stringify(payload));
}

export function readGoogleOAuthPending(): GoogleOAuthPending | null {
	if (typeof window === 'undefined') return null;
	const raw = sessionStorage.getItem(GOOGLE_OAUTH_PENDING_KEY);
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as GoogleOAuthPending;
		if (!parsed?.mode || !parsed?.returnTo) return null;
		// Ignore stale pending sessions (> 30 min).
		if (Date.now() - (parsed.createdAt || 0) > 30 * 60 * 1000) {
			clearGoogleOAuthPending();
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}

export function clearGoogleOAuthPending(): void {
	if (typeof window === 'undefined') return;
	sessionStorage.removeItem(GOOGLE_OAUTH_PENDING_KEY);
}

/** Encode pending context in OAuth `state` — survives in-app browser hops where sessionStorage is lost. */
export function encodeGoogleOAuthState(pending: Omit<GoogleOAuthPending, 'createdAt'>): string {
	const payload = JSON.stringify({
		m: pending.mode,
		r: pending.returnTo,
		t: Date.now(),
	});
	try {
		return `fx1.${btoa(unescape(encodeURIComponent(payload)))}`;
	} catch {
		return `fx1.${btoa(payload)}`;
	}
}

export function decodeGoogleOAuthState(state: string | null | undefined): GoogleOAuthPending | null {
	if (!state || !state.startsWith('fx1.')) return null;
	try {
		const raw = decodeURIComponent(escape(atob(state.slice(4))));
		const parsed = JSON.parse(raw) as { m?: GoogleOAuthMode; r?: string; t?: number };
		if (!parsed?.m || !parsed?.r) return null;
		if (parsed.t && Date.now() - parsed.t > 30 * 60 * 1000) return null;
		return { mode: parsed.m, returnTo: parsed.r, createdAt: parsed.t || Date.now() };
	} catch {
		return null;
	}
}

function getOrCreateCodeClient(
	clientId: string,
	uxMode: GoogleAuthUxMode,
	redirectState?: string,
): { requestCode: () => void; mode?: GoogleAuthUxMode } {
	// Redirect clients must be recreated per attempt so `state` carries the latest mode/returnTo.
	if (
		window.__fixoraGoogleCodeClient__ &&
		(uxMode === 'redirect' ||
			cachedGoogleClientId !== clientId ||
			cachedUxMode !== uxMode)
	) {
=======
function clearPopupClosedTimer() {
	if (popupClosedTimer) {
		clearTimeout(popupClosedTimer);
		popupClosedTimer = null;
	}
}

/**
 * Prefer Google ID token (JWT) — avoids fragile auth-code popup cancel races.
 * Renders the official GIS button in a short-lived overlay (required by Google).
 */
function requestGoogleIdToken(clientId: string): Promise<string> {
	const idApi = window.google?.accounts?.id;
	if (!idApi) return Promise.reject(new Error('Google Identity Services not available'));

	return new Promise((resolve, reject) => {
		let settled = false;
		const overlay = document.createElement('div');
		overlay.setAttribute('data-fixora-google-overlay', '1');
		Object.assign(overlay.style, {
			position: 'fixed',
			inset: '0',
			zIndex: '2147483646',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			background: 'rgba(0,0,0,0.55)',
			padding: '24px',
		});

		const card = document.createElement('div');
		Object.assign(card.style, {
			background: '#1a1a1a',
			borderRadius: '16px',
			padding: '24px',
			maxWidth: '320px',
			width: '100%',
			textAlign: 'center',
			boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
			border: '1px solid rgba(255,255,255,0.08)',
		});

		const title = document.createElement('p');
		title.textContent = 'Continue with Google';
		Object.assign(title.style, {
			margin: '0 0 16px',
			color: '#f5f5f5',
			fontSize: '16px',
			fontWeight: '600',
			fontFamily: 'inherit',
		});

		const buttonHost = document.createElement('div');
		Object.assign(buttonHost.style, {
			display: 'flex',
			justifyContent: 'center',
			minHeight: '44px',
		});

		const cancelBtn = document.createElement('button');
		cancelBtn.type = 'button';
		cancelBtn.textContent = 'Cancel';
		Object.assign(cancelBtn.style, {
			marginTop: '16px',
			background: 'transparent',
			border: 'none',
			color: 'rgba(255,255,255,0.65)',
			cursor: 'pointer',
			fontSize: '14px',
		});

		card.appendChild(title);
		card.appendChild(buttonHost);
		card.appendChild(cancelBtn);
		overlay.appendChild(card);
		document.body.appendChild(overlay);

		const finish = (err?: Error, token?: string) => {
			if (settled) return;
			settled = true;
			try {
				idApi.cancel();
			} catch {
				/* ignore */
			}
			overlay.remove();
			if (err) reject(err);
			else resolve(token as string);
		};

		cancelBtn.addEventListener('click', () => finish(new Error('Google sign-in cancelled')));
		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) finish(new Error('Google sign-in cancelled'));
		});

		idApi.initialize({
			client_id: clientId,
			auto_select: false,
			cancel_on_tap_outside: true,
			context: 'signin',
			itp_support: true,
			use_fedcm_for_prompt: true,
			callback: (response) => {
				if (response.credential) {
					finish(undefined, response.credential);
					return;
				}
				finish(new Error('Google sign-in cancelled'));
			},
		});

		try {
			idApi.renderButton(buttonHost, {
				type: 'standard',
				theme: 'filled_blue',
				size: 'large',
				text: 'continue_with',
				shape: 'rectangular',
				logo_alignment: 'left',
				width: 280,
			});
		} catch (err) {
			finish(err instanceof Error ? err : new Error('Google sign-in could not start'));
		}
	});
}

function getOrCreateCodeClient(clientId: string): { requestCode: () => void } {
	if (window.__fixoraGoogleCodeClient__ && cachedGoogleClientId !== clientId) {
>>>>>>> origin/cursor/fix-google-oauth-cancel-73f3
		window.__fixoraGoogleCodeClient__ = undefined;
		lastHandledAuthCode = '';
	}

	const existing = window.__fixoraGoogleCodeClient__;
	if (existing) return existing;

	cachedGoogleClientId = clientId;
	cachedUxMode = uxMode;

	const oauth2 = window.google?.accounts?.oauth2;
	if (!oauth2) throw new Error('Google Identity Services not available');

<<<<<<< HEAD
	const client =
		uxMode === 'redirect'
			? oauth2.initCodeClient({
					client_id: clientId,
					scope: 'openid email profile',
					ux_mode: 'redirect',
					redirect_uri: getGoogleOAuthRedirectUri(),
					state: redirectState || encodeGoogleOAuthState({ mode: 'login', returnTo: '/login' }),
					callback: () => undefined,
					error_callback: () => {
						window.__fixoraGoogleAuthInFlight__ = false;
					},
				})
			: oauth2.initCodeClient({
					client_id: clientId,
					scope: 'openid email profile',
					ux_mode: 'popup',
					redirect_uri: 'postmessage',
					callback: (response) => {
						window.__fixoraGoogleAuthInFlight__ = false;
						if (response.error || !response.code) {
							pendingReject?.(new Error(response.error || 'Google sign-in cancelled'));
							clearPending();
							return;
						}
						if (response.code === lastHandledAuthCode) return;
						lastHandledAuthCode = response.code;
						pendingResolve?.(response.code);
						clearPending();
					},
					error_callback: () => {
						window.__fixoraGoogleAuthInFlight__ = false;
						pendingReject?.(new Error('Google sign-in cancelled'));
						clearPending();
					},
				});
=======
	const client = oauth2.initCodeClient({
		client_id: clientId,
		scope: 'openid email profile',
		ux_mode: 'popup',
		redirect_uri: 'postmessage',
		callback: (response) => {
			clearPopupClosedTimer();
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
				clearPopupClosedTimer();
				pendingReject?.(new Error('Google sign-in popup blocked'));
				clearPending();
				return;
			}
			if (type === 'popup_closed') {
				// GIS can emit popup_closed around the same time as a successful code callback.
				clearPopupClosedTimer();
				popupClosedTimer = setTimeout(() => {
					popupClosedTimer = null;
					if (!pendingReject) return;
					pendingReject(
						new Error(
							'Google sign-in popup closed — if origins are set, check OAuth consent screen (Testing → add test users) or try again',
						),
					);
					clearPending();
				}, POPUP_CLOSED_GRACE_MS);
				return;
			}
			clearPopupClosedTimer();
			if (error?.message) {
				pendingReject?.(new Error(`Google sign-in failed: ${error.message}`));
			} else {
				pendingReject?.(new Error('Google sign-in cancelled'));
			}
			clearPending();
		},
	});
>>>>>>> origin/cursor/fix-google-oauth-cancel-73f3

	// Do NOT object-spread GIS clients — `requestCode` is often non-enumerable and gets dropped.
	(client as { requestCode: () => void; mode?: GoogleAuthUxMode }).mode = uxMode;
	window.__fixoraGoogleCodeClient__ = client as { requestCode: () => void; mode?: GoogleAuthUxMode };
	return window.__fixoraGoogleCodeClient__;
}

let pendingResolve: ((code: string) => void) | null = null;
let pendingReject: ((err: Error) => void) | null = null;

function clearPending() {
	pendingResolve = null;
	pendingReject = null;
}

<<<<<<< HEAD
/**
 * Start Google auth. Desktop keeps popup; phones / in-app browsers use full-page redirect
 * so popup blockers and postMessage breakage do not fail the flow.
 */
export async function startGoogleAuth(
	clientId: string,
	options: { mode: GoogleOAuthMode; returnTo: string },
): Promise<GoogleAuthStartResult> {
=======
/** Auth-code popup fallback (legacy). Prefer {@link requestGoogleCredential}. */
export async function requestGoogleAuthCode(clientId: string): Promise<string> {
>>>>>>> origin/cursor/fix-google-oauth-cancel-73f3
	if (window.__fixoraGoogleAuthInFlight__) {
		throw new Error('Google sign-in already in progress');
	}

	await loadGoogleGisScript();

	const uxMode: GoogleAuthUxMode = prefersGoogleRedirectFlow() ? 'redirect' : 'popup';

	if (uxMode === 'redirect') {
		const pending = { mode: options.mode, returnTo: options.returnTo };
		saveGoogleOAuthPending(pending);
		window.__fixoraGoogleAuthInFlight__ = true;
		try {
			getOrCreateCodeClient(clientId, 'redirect', encodeGoogleOAuthState(pending)).requestCode();
			return { type: 'redirect' };
		} catch (err) {
			window.__fixoraGoogleAuthInFlight__ = false;
			clearGoogleOAuthPending();
			throw err instanceof Error ? err : new Error('Google sign-in could not start');
		}
	}

	return new Promise((resolve, reject) => {
<<<<<<< HEAD
		pendingResolve = (code) => resolve({ type: 'code', code });
=======
		clearPopupClosedTimer();
		pendingResolve = resolve;
>>>>>>> origin/cursor/fix-google-oauth-cancel-73f3
		pendingReject = reject;
		window.__fixoraGoogleAuthInFlight__ = true;

		try {
			getOrCreateCodeClient(clientId, 'popup').requestCode();
		} catch (err) {
			window.__fixoraGoogleAuthInFlight__ = false;
			clearPending();
			reject(err instanceof Error ? err : new Error('Google sign-in could not start'));
		}
	});
}

<<<<<<< HEAD
/** @deprecated Prefer startGoogleAuth — kept for any legacy callers. */
export async function requestGoogleAuthCode(clientId: string): Promise<string> {
	const result = await startGoogleAuth(clientId, {
		mode: 'login',
		returnTo: typeof window !== 'undefined' ? window.location.pathname : '/login',
	});
	if (result.type === 'redirect') {
		throw new Error('Google sign-in redirect started');
	}
	return result.code;
}

export function parseGoogleRedirectCallback(search: string): {
	code?: string;
	error?: string;
	state?: string;
} {
	const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
	const code = params.get('code')?.trim() || undefined;
	const error = params.get('error')?.trim() || undefined;
	const state = params.get('state')?.trim() || undefined;
	return { code, error, state };
=======
/**
 * Google credential for `loginWithOAuth`:
 * 1) ID token via official GIS button (reliable)
 * 2) Auth-code popup fallback
 */
export async function requestGoogleCredential(clientId: string): Promise<string> {
	if (window.__fixoraGoogleAuthInFlight__) {
		throw new Error('Google sign-in already in progress');
	}

	await loadGoogleGisScript();
	window.__fixoraGoogleAuthInFlight__ = true;

	try {
		return await requestGoogleIdToken(clientId);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		// User dismissed the ID-token overlay — don't open another popup.
		if (/cancel/i.test(message)) throw err;
		// Allow auth-code helper to own the in-flight flag.
		window.__fixoraGoogleAuthInFlight__ = false;
		return await requestGoogleAuthCode(clientId);
	} finally {
		window.__fixoraGoogleAuthInFlight__ = false;
	}
>>>>>>> origin/cursor/fix-google-oauth-cancel-73f3
}

export {};
