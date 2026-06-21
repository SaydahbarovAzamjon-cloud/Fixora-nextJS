export type FixoraWsEvent = 'notificationReceived' | 'messageReceived';

type FixoraWsListener = (data: unknown) => void;

const listeners: Record<FixoraWsEvent, Set<FixoraWsListener>> = {
	notificationReceived: new Set(),
	messageReceived: new Set(),
};

const FIXORA_WS_EVENTS = new Set<string>(['notificationReceived', 'messageReceived']);

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
