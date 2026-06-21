import { Story } from '../types/fixora/fixora';
import { resolveProfileImageUrl } from './profileImage';
import type { StoryViewerOwner } from '../components/story/StoryViewerModal';

export interface StoryGroup {
	userId: string;
	owner: StoryViewerOwner;
	stories: Story[];
}

export function groupStoriesByUser(stories: Story[]): StoryGroup[] {
	const map = new Map<string, Story[]>();

	stories.forEach((story) => {
		const list = map.get(story.userId) ?? [];
		list.push(story);
		map.set(story.userId, list);
	});

	return Array.from(map.entries()).map(([userId, list]) => {
		const sorted = [...list].sort(
			(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
		const userData = sorted[0]?.userData;
		const name =
			userData?.userFullName?.trim() ||
			userData?.userNickname?.trim() ||
			'Technician';
		const avatar = userData?.userProfileImage
			? resolveProfileImageUrl(userData.userProfileImage)
			: undefined;

		return {
			userId,
			owner: { id: userId, name, avatar },
			stories: sorted,
		};
	});
}

export function isStoryGroupSeen(storyIds: string[], isSeen: (id: string) => boolean): boolean {
	return storyIds.length > 0 && storyIds.every(isSeen);
}
