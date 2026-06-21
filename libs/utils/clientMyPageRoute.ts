export const CLIENT_MY_PAGE = '/client/my-page';

export type OwnerMyPageTab =
	| 'activeRequests'
	| 'repairHistory'
	| 'savedTechnicians'
	| 'following'
	| 'reviews'
	| 'settings';
export const OWNER_MY_PAGE_TABS: OwnerMyPageTab[] = [
	'activeRequests',
	'repairHistory',
	'savedTechnicians',
	'following',
	'reviews',
	'settings',
];

const LEGACY_TAB_MAP: Record<string, OwnerMyPageTab> = {
	requests: 'activeRequests',
	stories: 'repairHistory',
	following: 'following',
	settings: 'settings',
};

export const parseOwnerMyPageTab = (tab: string | string[] | undefined): OwnerMyPageTab => {
	const value = Array.isArray(tab) ? tab[0] : tab;
	if (value && OWNER_MY_PAGE_TABS.includes(value as OwnerMyPageTab)) {
		return value as OwnerMyPageTab;
	}
	if (value && LEGACY_TAB_MAP[value]) {
		return LEGACY_TAB_MAP[value];
	}
	return 'activeRequests';
};

export const ownerMyPageHref = (tab: OwnerMyPageTab = 'activeRequests', section?: string) => {
	const params = new URLSearchParams();
	params.set('tab', tab);
	if (section) params.set('section', section);
	return `${CLIENT_MY_PAGE}?${params.toString()}`;
};

export const isClientMyPageRoute = (pathname: string) =>
	pathname === CLIENT_MY_PAGE || pathname.startsWith('/mypage');
