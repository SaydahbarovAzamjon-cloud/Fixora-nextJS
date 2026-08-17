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
const GOOGLE_OAUTH_PENDING_KEY = 'fixora_google_oauth_pending';
const GOOGLE_OAUTH_CALLBACK_PATH = '/oauth/google';
const GOOGLE_REDIRECT_STARTED = 'GOOGLE_OAUTH_REDIRECT_STARTED';

export type GoogleAuthUxMode = 'popup' | 'redirect';
export type GoogleOAuthMode = 'login' | 'register';

export interface GoogleOAuthPending {
	mode: GoogleOAuthMode;
	returnTo: string;
	createdAt: number;
}

export type GoogleAuthStartResult = { type: 'code'; code: string } | { type: 'redirect' };

let scriptReadyPromise: Promise<void> | null = null;
let scriptReadyResolvers: Array<() => void> = [];
let lastHandledAuthCode = '';
let cachedGoogleClientId: string | null = null;
let cachedUxMode: GoogleAuthUxMode | null = null;

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

export function encodeGoogleOAuthState(pending: Omit<GoogleOAuthPending, 'createdAt'>): string {
	const payload = JSON.stringify({ m: pending.mode, r: pending.returnTo, t: Date.now() });
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
	if (
		window.__fixoraGoogleCodeClient__ &&
		(uxMode === 'redirect' || cachedGoogleClientId !== clientId || cachedUxMode !== uxMode)
	) {
		window.__fixoraGoogleCodeClient__ = undefined;
		lastHandledAuthCode = '';
	}

	const existing = window.__fixoraGoogleCodeClient__;
	if (existing) return existing;

	cachedGoogleClientId = clientId;
	cachedUxMode = uxMode;

	const oauth2 = window.google?.accounts?.oauth2;
	if (!oauth2) throw new Error('Google Identity Services not available');

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

export function isGoogleRedirectStartedError(err: unknown): boolean {
	return err instanceof Error && err.message === GOOGLE_REDIRECT_STARTED;
}

export async function startGoogleAuth(
	clientId: string,
	options: { mode: GoogleOAuthMode; returnTo: string },
): Promise<GoogleAuthStartResult> {
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
		pendingResolve = (code) => resolve({ type: 'code', code });
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

/** @deprecated Prefer startGoogleAuth — kept for compatibility callers. */
export async function requestGoogleAuthCode(clientId: string): Promise<string> {
	const result = await startGoogleAuth(clientId, {
		mode: 'login',
		returnTo: typeof window !== 'undefined' ? window.location.pathname : '/login',
	});
	if (result.type === 'redirect') throw new Error(GOOGLE_REDIRECT_STARTED);
	return result.code;
}

/**
 * Compatibility entrypoint expected by SocialAuthRow.
 * Returns popup auth code, or `null` when mobile redirect flow was started.
 */
export async function requestGoogleCredential(
	clientId: string,
	options?: { mode?: GoogleOAuthMode; returnTo?: string },
): Promise<string | null> {
	const result = await startGoogleAuth(clientId, {
		mode: options?.mode ?? 'login',
		returnTo:
			options?.returnTo ??
			(typeof window !== 'undefined' ? window.location.pathname : '/login'),
	});
	if (result.type === 'redirect') return null;
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
}

export {};
