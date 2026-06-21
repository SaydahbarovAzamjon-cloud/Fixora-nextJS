import { fixoraWsConnectedVar, socketVar } from '../../apollo/store';

export type FixoraWsEvent = 'notificationReceived' | 'messageReceived';

type FixoraWsListener = (data: unknown) => void;

const listeners: Record<FixoraWsEvent, Set<FixoraWsListener>> = {
	notificationReceived: new Set(),
	messageReceived: new Set(),
};

const FIXORA_WS_EVENTS = new Set<string>(['notificationReceived', 'messageReceived']);

const RECONNECT_DELAY_MS = 5000;

let activeSocket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let intentionalClose = false;

export function getFixoraWsBaseUrl(): string {
	const base =
		(typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WS_URL) ||
		(typeof process !== 'undefined' && process.env.REACT_APP_API_WS) ||
		'ws://localhost:2000';
	return base.replace(/\/$/, '');
}

/** Parse FixoraB WS payloads (`event` / `type` + optional `data`). Ignores legacy chat frames. */
export function parseFixoraWsMessage(raw: string): { event: FixoraWsEvent; data: unknown } | null {
	try {
		const parsed = JSON.parse(raw) as Record<string, unknown>;
		const eventName = parsed.event ?? parsed.type ?? parsed.name;
		if (typeof eventName !== 'string' || !FIXORA_WS_EVENTS.has(eventName)) return null;
		const data =
			parsed.data ??
			parsed.payload ??
			parsed.notification ??
			parsed.message ??
			null;
		return { event: eventName as FixoraWsEvent, data };
	} catch {
		return null;
	}
}

export function dispatchFixoraWsMessage(raw: string) {
	const parsed = parseFixoraWsMessage(raw);
	if (!parsed) return;
	listeners[parsed.event].forEach((listener) => {
		try {
			listener(parsed.data);
		} catch (err) {
			if (process.env.NEXT_PUBLIC_APOLLO_DEBUG === 'true') {
				console.debug('[Fixora WS listener error]', err);
			}
		}
	});
}

export function subscribeFixoraWsEvent(event: FixoraWsEvent, listener: FixoraWsListener) {
	listeners[event].add(listener);
	return () => listeners[event].delete(listener);
}

function clearReconnectTimer() {
	if (reconnectTimer) {
		clearTimeout(reconnectTimer);
		reconnectTimer = null;
	}
}

function scheduleReconnect() {
	if (intentionalClose || reconnectTimer) return;
	reconnectTimer = setTimeout(() => {
		reconnectTimer = null;
		const token = getConnectToken();
		if (token) connectFixoraWebSocket(token);
	}, RECONNECT_DELAY_MS);
}

function getConnectToken(): string {
	if (typeof window === 'undefined') return '';
	// Lazy import avoids circular deps with libs/auth
	const token = window.localStorage.getItem('accessToken');
	return token ?? '';
}

/**
 * Dedicated auth WebSocket for Fixora push events.
 * Apollo subscription link is unused in MVP — this connection drives realtime refetches.
 */
export function connectFixoraWebSocket(token: string) {
	if (typeof window === 'undefined' || !token) return;

	if (
		activeSocket &&
		(activeSocket.readyState === WebSocket.OPEN || activeSocket.readyState === WebSocket.CONNECTING)
	) {
		return;
	}

	intentionalClose = false;
	clearReconnectTimer();

	if (activeSocket) {
		activeSocket.close();
		activeSocket = null;
	}

	const url = `${getFixoraWsBaseUrl()}?token=${encodeURIComponent(token)}`;
	const socket = new WebSocket(url);
	activeSocket = socket;
	socketVar(socket);

	socket.onopen = () => {
		fixoraWsConnectedVar(true);
		if (process.env.NEXT_PUBLIC_APOLLO_DEBUG === 'true') {
			console.debug('[Fixora WS] connected');
		}
	};

	socket.onmessage = (event) => {
		if (typeof event.data === 'string') {
			dispatchFixoraWsMessage(event.data);
		}
	};

	socket.onerror = () => {
		fixoraWsConnectedVar(false);
	};

	socket.onclose = () => {
		fixoraWsConnectedVar(false);
		activeSocket = null;
		if (!intentionalClose) scheduleReconnect();
	};
}

export function disconnectFixoraWebSocket() {
	intentionalClose = true;
	clearReconnectTimer();
	if (activeSocket) {
		activeSocket.close();
		activeSocket = null;
	}
	fixoraWsConnectedVar(false);
}
