/** Normalize pathname for comparison (next.config trailingSlash: true). */
export function normalizeRoutePath(path: string): string {
	const base = (path.split('?')[0].split('#')[0] || '/').trim();
	if (base === '/') return '/';
	return base.replace(/\/+$/, '');
}

export function routePathsEqual(current: string, target: string): boolean {
	return normalizeRoutePath(current) === normalizeRoutePath(target);
}
