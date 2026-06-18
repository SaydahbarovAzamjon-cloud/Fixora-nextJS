const DEFAULT_AVATAR = '/img/profile/defaultUser.svg';

/** Resolve profile image path from JWT, GraphQL, or legacy member fields. */
export function resolveProfileImageUrl(image?: string | null): string {
	if (!image || image.trim() === '') return DEFAULT_AVATAR;
	if (image.startsWith('blob:') || image.startsWith('data:')) return image;
	if (image.startsWith('http://') || image.startsWith('https://')) return image;
	if (image.startsWith('/img/') || image.startsWith('/public/')) return image;
	if (image === DEFAULT_AVATAR) return DEFAULT_AVATAR;

	const base = process.env.REACT_APP_API_URL?.replace(/\/$/, '') ?? '';
	if (!base) return image.startsWith('/') ? image : `/${image}`;
	return `${base}/${image.replace(/^\//, '')}`;
}
