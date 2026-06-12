export const SERVICES = ['screenRepair', 'batteryIssue', 'waterDamage', 'iphoneRepair', 'macbookRepair'] as const;

export const SERVICE_ISSUE_CATEGORY: Partial<Record<(typeof SERVICES)[number], string>> = {
	screenRepair: 'SCREEN',
	batteryIssue: 'BATTERY',
	waterDamage: 'WATER_DAMAGE',
};

export const SERVICE_DEVICE_CATEGORY: Partial<Record<(typeof SERVICES)[number], string>> = {
	iphoneRepair: 'IPHONE',
	macbookRepair: 'MACBOOK',
};
