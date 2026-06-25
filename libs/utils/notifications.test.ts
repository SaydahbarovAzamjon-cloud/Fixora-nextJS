import { describe, expect, it } from 'vitest';
import type { Notification } from '../types/fixora/fixora';
import {
	filterCustomerNotifications,
	filterNavbarNotifications,
	getNotificationActorId,
	getNotificationLink,
	isCustomerNotification,
} from './notifications';

const base = (overrides: Partial<Notification>): Notification => ({
	_id: 'n1',
	userId: 'sender-abc',
	receiverId: 'receiver-xyz',
	notificationType: 'MESSAGE',
	notificationTitle: 'New message',
	notificationDescription: 'Hello there',
	referenceType: 'MESSAGE',
	referenceId: 'msg-id-not-for-nav',
	isRead: false,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	...overrides,
});

describe('getNotificationLink', () => {
	it('deep-links MESSAGE to customer chat with actor userId as peerId', () => {
		const n = base({});
		expect(getNotificationLink(n, { isTechnician: false })).toBe('/messages?peerId=sender-abc');
	});

	it('deep-links MESSAGE to technician chat', () => {
		const n = base({});
		expect(getNotificationLink(n, { isTechnician: true })).toBe(
			'/technician/messages?peerId=sender-abc',
		);
	});

	it('does not use referenceId (message _id) for navigation', () => {
		const n = base({ referenceId: 'wrong-peer-id', userId: 'real-sender' });
		expect(getNotificationLink(n)).toContain('peerId=real-sender');
		expect(getNotificationLink(n)).not.toContain('wrong-peer-id');
	});
});

describe('getNotificationActorId', () => {
	it('returns userId as sender/actor', () => {
		expect(getNotificationActorId(base({ userId: 'u-99' }))).toBe('u-99');
	});
});

describe('customer notification filters', () => {
	it('includes BOOKING and MESSAGE only', () => {
		const list = [
			base({ notificationType: 'MESSAGE' }),
			base({ _id: 'n2', notificationType: 'BOOKING', referenceType: 'BOOKING' }),
			base({ _id: 'n3', notificationType: 'FOLLOW', referenceType: 'USER' }),
		];
		expect(filterCustomerNotifications(list)).toHaveLength(2);
		expect(isCustomerNotification(base({ notificationType: 'LIKE' }))).toBe(false);
	});

	it('navbar filter for customer excludes social noise', () => {
		const list = [
			base({ notificationType: 'MESSAGE' }),
			base({ _id: 'n2', notificationType: 'LIKE' }),
		];
		expect(filterNavbarNotifications(list, false)).toHaveLength(1);
		expect(filterNavbarNotifications(list, true)).toHaveLength(2);
	});
});
