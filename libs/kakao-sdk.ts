declare global {
	interface Window {
		Kakao?: {
			isInitialized: () => boolean;
			init: (key: string) => void;
			Auth: {
				login: (options: {
					throughTalk?: boolean;
					success: (auth: { access_token: string }) => void;
					fail: (err: unknown) => void;
				}) => void;
			};
		};
		__fixoraKakaoAuthInFlight__?: boolean;
	}
}

const KAKAO_SCRIPT_ID = 'kakao-sdk-script';
const KAKAO_SCRIPT_SRC = 'https://developers.kakao.com/sdk/js/kakao.js';
const KAKAO_LOGIN_TIMEOUT_MS = 120_000;

export function loadKakaoSdk(): Promise<NonNullable<Window['Kakao']>> {
	if (typeof window === 'undefined') {
		return Promise.reject(new Error('Kakao SDK requires browser'));
	}

	const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
	if (!jsKey) {
		return Promise.reject(new Error('KAKAO_NOT_CONFIGURED'));
	}

	const initKakao = () => {
		if (!window.Kakao) throw new Error('Kakao SDK not loaded');
		if (!window.Kakao.isInitialized()) {
			window.Kakao.init(jsKey);
		}
		return window.Kakao;
	};

	if (window.Kakao?.isInitialized()) {
		return Promise.resolve(window.Kakao);
	}

	const existing = document.getElementById(KAKAO_SCRIPT_ID);
	if (existing) {
		// Script may already be loaded — `load` won't fire again, so resolve immediately.
		if (window.Kakao) {
			return Promise.resolve(initKakao());
		}
		return new Promise((resolve, reject) => {
			const onLoad = () => {
				cleanup();
				try {
					resolve(initKakao());
				} catch (e) {
					reject(e);
				}
			};
			const onError = () => {
				cleanup();
				reject(new Error('Kakao SDK script failed'));
			};
			const cleanup = () => {
				existing.removeEventListener('load', onLoad);
				existing.removeEventListener('error', onError);
			};
			existing.addEventListener('load', onLoad);
			existing.addEventListener('error', onError);
		});
	}

	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.id = KAKAO_SCRIPT_ID;
		script.src = KAKAO_SCRIPT_SRC;
		script.async = true;
		script.onload = () => {
			try {
				resolve(initKakao());
			} catch (e) {
				reject(e);
			}
		};
		script.onerror = () => reject(new Error('Kakao SDK script failed'));
		document.head.appendChild(script);
	});
}

export async function requestKakaoAccessToken(): Promise<string> {
	if (typeof window !== 'undefined' && window.__fixoraKakaoAuthInFlight__) {
		throw new Error('Kakao sign-in already in progress');
	}

	const Kakao = await loadKakaoSdk();

	if (typeof window !== 'undefined') {
		window.__fixoraKakaoAuthInFlight__ = true;
	}

	try {
		return await new Promise<string>((resolve, reject) => {
			const timeoutId = window.setTimeout(() => {
				reject(new Error('Kakao sign-in timed out'));
			}, KAKAO_LOGIN_TIMEOUT_MS);

			Kakao.Auth.login({
				// Desktop web: avoid KakaoTalk app handoff that can stall the popup flow.
				throughTalk: false,
				success: (auth) => {
					window.clearTimeout(timeoutId);
					if (!auth?.access_token) {
						reject(new Error('Kakao sign-in returned no access token'));
						return;
					}
					resolve(auth.access_token);
				},
				fail: (err) => {
					window.clearTimeout(timeoutId);
					const message =
						typeof err === 'object' && err !== null && 'error' in err
							? String((err as { error?: string }).error)
							: typeof err === 'object' && err !== null && 'error_description' in err
								? String((err as { error_description?: string }).error_description)
								: 'Kakao sign-in cancelled';
					reject(new Error(message));
				},
			});
		});
	} finally {
		if (typeof window !== 'undefined') {
			window.__fixoraKakaoAuthInFlight__ = false;
		}
	}
}

export {};