export type FaqCategory = 'booking' | 'payment' | 'customers' | 'technicians' | 'community' | 'other';

export const FAQ_CATEGORIES: FaqCategory[] = ['booking', 'payment', 'customers', 'technicians', 'community', 'other'];

export const FAQ_ITEMS: Record<FaqCategory, string[]> = {
	booking: ['q1', 'q2', 'q3', 'q4', 'q5'],
	payment: ['q1', 'q2', 'q3', 'q4', 'q5'],
	customers: ['q1', 'q2', 'q3', 'q4', 'q5'],
	technicians: ['q1', 'q2', 'q3', 'q4', 'q5'],
	community: ['q1', 'q2', 'q3', 'q4', 'q5'],
	other: ['q1', 'q2', 'q3', 'q4', 'q5'],
};

export function faqPanelId(category: FaqCategory, item: string): string {
	return `${category}-${item}`;
}
