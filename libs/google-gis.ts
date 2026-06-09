declare global {
	interface Window {
		google?: {
			accounts: {
				oauth2: {
					initCodeClient: (config: {
						client_id: string;
						scope: string;
						ux_mode: 'popup' | 'redirect';
						redirect_uri?: string;
						callback: (response: { code?: string; error?: string }) => void;
					}) => { requestCode: () => void };
				};
			};
		};
	}
}

const GIS_SCRIPT_ID = 'google-gis-script';
const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

export function loadGoogleGisScript(): Promise<void> {
	if (typeof window === 'undefined') return Promise.resolve();
	if (window.google?.accounts?.oauth2) return Promise.resolve();

	const existing = document.getElementById(GIS_SCRIPT_ID);
	if (existing) {
		return new Promise((resolve, reject) => {
			existing.addEventListener('load', () => resolve());
			existing.addEventListener('error', () => reject(new Error('Google GIS script failed')));
		});
	}

	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.id = GIS_SCRIPT_ID;
		script.src = GIS_SCRIPT_SRC;
		script.async = true;
		script.defer = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error('Google GIS script failed'));
		document.head.appendChild(script);
	});
}

export async function requestGoogleAuthCode(clientId: string): Promise<string> {
	await loadGoogleGisScript();

	if (!window.google?.accounts?.oauth2) {
		throw new Error('Google Identity Services not available');
	}

	return new Promise((resolve, reject) => {
		const client = window.google!.accounts.oauth2.initCodeClient({
			client_id: clientId,
			scope: 'openid email profile',
			ux_mode: 'popup',
			redirect_uri: 'postmessage',
			callback: (response) => {
				if (response.code) resolve(response.code);
				else reject(new Error(response.error || 'Google sign-in cancelled'));
			},
		});
		client.requestCode();
	});
}

export {};