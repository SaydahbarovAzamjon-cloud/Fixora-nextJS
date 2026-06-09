declare global {
	interface Window {
		Kakao?: {
			isInitialized: () => boolean;
			init: (key: string) => void;
			Auth: {
				login: (options: {
					success: (auth: { access_token: string }) => void;
					fail: (err: unknown) => void;
				}) => void;
			};
		};
	}
}

const KAKAO_SCRIPT_ID = 'kakao-sdk-script';
const KAKAO_SCRIPT_SRC = 'https://developers.kakao.com/sdk/js/kakao.js';

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
		return new Promise((resolve, reject) => {
			existing.addEventListener('load', () => {
				try {
					resolve(initKakao());
				} catch (e) {
					reject(e);
				}
			});
			existing.addEventListener('error', () => reject(new Error('Kakao SDK script failed')));
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
	const Kakao = await loadKakaoSdk();

	return new Promise((resolve, reject) => {
		Kakao.Auth.login({
			success: (auth) => resolve(auth.access_token),
			fail: (err) => reject(err),
		});
	});
}

export {};