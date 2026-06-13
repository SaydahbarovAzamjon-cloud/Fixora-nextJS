// Temp verification script — CDP against headless Edge (with hover)
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9444;

const edge = spawn(EDGE, [
	'--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`,
	'--window-size=1600,1200', '--user-data-dir=' + process.env.TEMP + '\\edge-cdp-prof',
	'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWs() {
	for (let i = 0; i < 30; i++) {
		try {
			const res = await fetch(`http://127.0.0.1:${PORT}/json`);
			const tabs = await res.json();
			const page = tabs.find((t) => t.type === 'page');
			if (page) return page.webSocketDebuggerUrl;
		} catch {}
		await sleep(500);
	}
	throw new Error('no CDP endpoint');
}

const ws = new WebSocket(await getWs());
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
	const msg = JSON.parse(ev.data);
	if (msg.id && pending.has(msg.id)) {
		pending.get(msg.id)(msg);
		pending.delete(msg.id);
	}
};
const send = (method, params = {}) =>
	new Promise((resolve) => {
		const mid = ++id;
		pending.set(mid, resolve);
		ws.send(JSON.stringify({ id: mid, method, params }));
	});

const evaluate = async (expr) => {
	const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
	return res.result?.result?.value ?? res;
};

await send('Page.enable');
await send('Page.navigate', { url: 'http://localhost:3000' });
for (let i = 0; i < 40; i++) {
	const n = await evaluate(`document.querySelectorAll('.fixora-tech-card').length`);
	if (n > 0) break;
	await sleep(500);
}
await sleep(1500);

const report = await evaluate(`(() => {
	const rect = (el) => { const r = el.getBoundingClientRect(); return { y: Math.round(r.y), bottom: Math.round(r.bottom), h: Math.round(r.height) }; };
	const sw = document.querySelector('.fixora-home-technicians__swiper');
	const cards = [...document.querySelectorAll('.fixora-tech-card')];
	const badge = document.querySelector('.fixora-tech-card__badge');
	return {
		swiper: rect(sw),
		cardHeights: cards.slice(0, 5).map((c) => rect(c).h),
		firstCard: rect(cards[0]),
		badge: badge ? rect(badge) : null,
		boxSizing: getComputedStyle(cards[0]).boxSizing,
		clippedBottom: cards[0].getBoundingClientRect().bottom > sw.getBoundingClientRect().bottom,
		clippedTopOnHoverRoom: cards[0].getBoundingClientRect().top - sw.getBoundingClientRect().top,
	};
})()`);
console.log(JSON.stringify(report, null, 2));

// scroll section into view and hover the first card
await evaluate(`document.querySelector('.fixora-home-technicians')?.scrollIntoView({block:'center'})`);
await sleep(800);
const pt = await evaluate(`(() => { const r = document.querySelector('.fixora-tech-card').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pt.x, y: pt.y });
await sleep(600);
const shot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync('.claude-tmp-shot.png', Buffer.from(shot.result.data, 'base64'));
console.log('screenshot saved (first card hovered)');

edge.kill();
process.exit(0);
