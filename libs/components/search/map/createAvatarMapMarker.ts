export interface AvatarMapMarkerOptions {
	technicianId: string;
	label: string;
	avatarUrl: string;
	isSelected: boolean;
	onSelect: (technicianId: string) => void;
	onHoverEnter?: () => void;
	onHoverLeave?: () => void;
}

export function createAvatarMapMarkerElement({
	technicianId,
	label,
	avatarUrl,
	isSelected,
	onSelect,
	onHoverEnter,
	onHoverLeave,
}: AvatarMapMarkerOptions): HTMLButtonElement {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = `fixora-map-avatar-marker${isSelected ? ' fixora-map-avatar-marker--selected' : ''}`;
	button.setAttribute('aria-label', label);

	const img = document.createElement('img');
	img.className = 'fixora-map-avatar-marker__img';
	img.src = avatarUrl;
	img.alt = '';
	img.addEventListener('error', () => {
		img.src = '/img/profile/defaultUser.svg';
	});

	const name = document.createElement('span');
	name.className = 'fixora-map-avatar-marker__name';
	name.textContent = label;

	button.appendChild(img);
	button.appendChild(name);

	button.addEventListener('click', (event) => {
		event.preventDefault();
		event.stopPropagation();
		onSelect(technicianId);
	});

	if (onHoverEnter) {
		button.addEventListener('mouseenter', onHoverEnter);
	}
	if (onHoverLeave) {
		button.addEventListener('mouseleave', onHoverLeave);
	}

	return button;
}

export function getAvatarMarkerLabel(
	nickname?: string,
	fullName?: string,
	shopName?: string,
	fallback = 'Technician',
): string {
	const person = nickname || fullName || '';
	const shop = shopName?.trim() || '';
	if (person) return person;
	if (shop) return shop;
	return fallback;
}
