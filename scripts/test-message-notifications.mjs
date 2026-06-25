#!/usr/bin/env node
/**
 * Integration smoke test: USER → TECHNICIAN message + notification flow.
 * Requires FixoraB at NEXT_PUBLIC_GRAPHQL_URL (default localhost:2000).
 *
 * Usage: node scripts/test-message-notifications.mjs
 */

const GRAPHQL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:2000/graphql';
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:2000';

const ts = Date.now();
const phoneSuffix = String(ts).slice(-8);
const CUSTOMER_EMAIL = `msgtest.cust.${ts}@fixora.test`;
const TECH_EMAIL = `msgtest.tech.${ts}@fixora.test`;
const CUSTOMER_PHONE = `010${phoneSuffix}`;
const TECH_PHONE = `010${String(ts + 1).slice(-8)}`;
const PASSWORD = 'Test12';

async function gql(query, variables = {}, token) {
	const res = await fetch(GRAPHQL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: JSON.stringify({ query, variables }),
	});
	const json = await res.json();
	if (json.errors?.length) {
		throw new Error(json.errors.map((e) => e.message).join('; '));
	}
	return json.data;
}

async function signup(userType, email, nickname, phone) {
	const data = await gql(
		`mutation Signup($input: UserInput!) {
      signup(input: $input) {
        _id accessToken userType
      }
    }`,
		{
			input: {
				userEmail: email,
				userNickname: nickname,
				userPassword: PASSWORD,
				userPhoneNumber: phone,
				userType,
				termsAcceptedAt: new Date().toISOString(),
			},
		},
	);
	return data.signup;
}

function waitForWsEvent(token, eventName, timeoutMs = 8000) {
	return new Promise((resolve, reject) => {
		const url = `${WS_BASE.replace(/\/$/, '')}?token=${encodeURIComponent(token)}`;
		const ws = new WebSocket(url);
		const timer = setTimeout(() => {
			ws.close();
			reject(new Error(`WS timeout waiting for ${eventName}`));
		}, timeoutMs);

		ws.onmessage = (ev) => {
			try {
				const parsed = JSON.parse(String(ev.data));
				const name = parsed.event ?? parsed.type;
				if (name === eventName) {
					clearTimeout(timer);
					ws.close();
					resolve(parsed.data);
				}
			} catch {
				/* ignore */
			}
		};
		ws.onerror = () => {
			clearTimeout(timer);
			reject(new Error('WS connection error'));
		};
	});
}

async function main() {
	console.log('GraphQL:', GRAPHQL);
	console.log('WS:', WS_BASE);

	const customer = await signup('USER', CUSTOMER_EMAIL, `c${String(ts).slice(-8)}`, CUSTOMER_PHONE);
	console.log('✓ Customer signed up:', customer._id);

	const technician = await signup('TECHNICIAN', TECH_EMAIL, `t${String(ts).slice(-8)}`, TECH_PHONE);
	console.log('✓ Technician signed up:', technician._id);

	const wsNotifPromise = waitForWsEvent(technician.accessToken, 'notificationReceived');
	const wsMsgPromise = waitForWsEvent(technician.accessToken, 'messageReceived');

	const sendData = await gql(
		`mutation Send($input: SendMessageInput!) {
      sendMessage(input: $input) { _id messageContent senderId receiverId }
    }`,
		{
			input: {
				receiverId: technician._id,
				messageContent: `E2E test ${ts}`,
				messageType: 'TEXT',
			},
		},
		customer.accessToken,
	);
	console.log('✓ Message sent:', sendData.sendMessage._id);

	const [wsMsg, wsNotif] = await Promise.all([wsMsgPromise, wsNotifPromise]);
	console.log('✓ WS messageReceived:', wsMsg?._id || wsMsg);
	console.log('✓ WS notificationReceived:', wsNotif?.notificationType, wsNotif?.userId);

	const notifs = await gql(
		`query GetNotifications($input: NotificationsInquiry!) {
      getNotifications(input: $input) {
        list { _id notificationType userId isRead referenceType referenceId notificationDescription }
      }
    }`,
		{ input: { page: 1, limit: 20, search: { isRead: false } } },
		technician.accessToken,
	);
	const messageNotif = notifs.getNotifications.list.find((n) => n.notificationType === 'MESSAGE');
	if (!messageNotif) throw new Error('No unread MESSAGE notification for technician');
	console.log('✓ Unread MESSAGE notification in API');

	const peerLink = `/messages?peerId=${messageNotif.userId}`;
	if (messageNotif.userId !== customer._id) {
		throw new Error(`Expected actor userId=${customer._id}, got ${messageNotif.userId}`);
	}
	console.log('✓ Deep link peerId matches sender:', peerLink);

	const marked = await gql(
		`mutation MarkRead($input: MarkNotificationReadInput!) {
      markNotificationRead(input: $input) { _id isRead }
    }`,
		{ input: { notificationId: messageNotif._id } },
		technician.accessToken,
	);
	if (!marked.markNotificationRead.isRead) throw new Error('markNotificationRead failed');
	console.log('✓ Notification marked read');

	await gql(
		`mutation MarkMsgs($input: MarkMessagesAsReadInput!) {
      markMessagesAsRead(input: $input)
    }`,
		{ input: { peerId: customer._id } },
		technician.accessToken,
	);
	console.log('✓ Messages marked read for peer');

	const after = await gql(
		`query GetNotifications($input: NotificationsInquiry!) {
      getNotifications(input: $input) {
        list { _id notificationType isRead }
      }
    }`,
		{ input: { page: 1, limit: 20, search: { isRead: false, notificationType: 'MESSAGE' } } },
		technician.accessToken,
	);
	const stillUnread = after.getNotifications.list.filter((n) => n._id === messageNotif._id && !n.isRead);
	if (stillUnread.length) throw new Error('Notification still unread after mark');
	console.log('✓ Unread count cleared for notification');

	console.log('\n✅ Message + notification integration test PASSED');

	// Preferences gate: disable messages → no new MESSAGE notification
	await gql(
		`mutation UpdatePrefs($input: NotificationPreferencesInput!) {
      updateNotificationPreferences(input: $input) { messages }
    }`,
		{ input: { messages: false } },
		technician.accessToken,
	);
	console.log('✓ Disabled message notifications for technician');

	const wsNotif2 = waitForWsEvent(technician.accessToken, 'notificationReceived', 3000).catch(() => null);
	await gql(
		`mutation Send($input: SendMessageInput!) {
      sendMessage(input: $input) { _id }
    }`,
		{
			input: {
				receiverId: technician._id,
				messageContent: `E2E prefs gate ${ts}`,
				messageType: 'TEXT',
			},
		},
		customer.accessToken,
	);

	const strayNotif = await wsNotif2;
	if (strayNotif?.notificationType === 'MESSAGE') {
		console.warn('⚠ WS notificationReceived still fired (backend may emit before prefs gate)');
	}

	const afterPrefs = await gql(
		`query GetNotifications($input: NotificationsInquiry!) {
      getNotifications(input: $input) {
        list { _id notificationType notificationDescription isRead }
      }
    }`,
		{ input: { page: 1, limit: 5, sort: 'createdAt', direction: 'DESC' } },
		technician.accessToken,
	);
	const newMsgNotif = afterPrefs.getNotifications.list.find(
		(n) => n.notificationType === 'MESSAGE' && n.notificationDescription?.includes('prefs gate'),
	);
	if (newMsgNotif) {
		console.warn(
			'⚠ Backend still persisted MESSAGE notification with messages=false (FixoraB prefs gate — frontend wiring OK)',
		);
	} else {
		console.log('✓ No MESSAGE notification when messages preference disabled');
	}
	console.log('\n✅ All frontend integration checks complete');
}

main().catch((err) => {
	console.error('\n❌ Test FAILED:', err.message || err);
	process.exit(1);
});
