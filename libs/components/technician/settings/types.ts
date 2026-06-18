export type SettingsSectionId =
	| 'profile'
	| 'account'
	| 'notifications'
	| 'security'
	| 'payment'
	| 'availability'
	| 'preferences'
	| 'danger';

export const SETTINGS_SECTIONS: SettingsSectionId[] = [
	'profile',
	'account',
	'notifications',
	'security',
	'payment',
	'availability',
	'preferences',
];

export function parseSettingsSection(value: unknown): SettingsSectionId {
	const valid: SettingsSectionId[] = [...SETTINGS_SECTIONS, 'danger'];
	if (typeof value === 'string' && valid.includes(value as SettingsSectionId)) {
		return value as SettingsSectionId;
	}
	return 'profile';
}
