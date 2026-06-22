import type { DeviceCategory } from '../types/fixora/fixora';

type PlaceholderField = 'model' | 'issue' | 'description';

/** i18n key in `common` for a device form placeholder, scoped by category when known. */
export function bookingDevicePlaceholderKey(field: PlaceholderField, category?: DeviceCategory | ''): string {
	if (category) return `booking.device.${field}Placeholder.${category}`;
	return `booking.device.${field}Placeholder`;
}
