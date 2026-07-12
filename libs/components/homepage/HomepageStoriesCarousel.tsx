import React, { useCallback, useMemo, useState } from 'react';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { GET_STORIES_CAROUSEL } from '../../../apollo/user/story';
import { getJwtToken } from '../../auth/tokens';
import { useIsClientReady } from '../../hooks/useIsClientReady';
import { Story } from '../../types/fixora/fixora';
import { groupStoriesByUser, isStoryGroupSeen } from '../../utils/storyGroups';
import { storyImageUrl } from '../story/storyImageUrl';
import { isStorySeen, markStorySeen } from '../story/storySeenStorage';
import StoryViewerModal from '../story/StoryViewerModal';

const LABEL_MAX = 14;

const truncateLabel = (value: string): string =>
	value.length > LABEL_MAX ? `${value.slice(0, LABEL_MAX)}…` : value;

const HomepageStoriesCarousel = () => {
	const { t } = useTranslation('common');
	const isClientReady = useIsClientReady();
	const isLoggedIn = isClientReady && !!getJwtToken();
	const [viewer, setViewer] = useState<{ groupIndex: number; storyIndex: number } | null>(null);
	const [seenIds, setSeenIds] = useState<Set<string>>(() => new Set());

	const { data } = useQuery(GET_STORIES_CAROUSEL, {
		variables: { input: { limit: 24 } },
		fetchPolicy: 'cache-and-network',
		skip: !isLoggedIn,
	});

	const stories: Story[] = data?.getStoriesCarousel?.list ?? [];

	const groups = useMemo(() => groupStoriesByUser(stories), [stories]);

	const markSeenHandler = useCallback((storyId: string) => {
		markStorySeen(storyId);
		setSeenIds((prev) => new Set(prev).add(storyId));
	}, []);

	const isSeen = useCallback(
		(storyId: string) => seenIds.has(storyId) || isStorySeen(storyId),
		[seenIds],
	);

	if (!isLoggedIn || groups.length === 0) return null;

	const activeGroup = viewer !== null ? groups[viewer.groupIndex] : null;

	return (
		<section className="fixora-home-stories">
			<div className="container">
				<h2 className="fixora-home-stories__title">{t('story.title')}</h2>

				<div className="fixora-home-stories__row">
					{groups.map((group, groupIndex) => {
						const coverStory = group.stories[0];
						const cover = storyImageUrl(coverStory?.images?.[0]?.url);
						const storyIds = group.stories.map((s) => s._id);
						const seen = isStoryGroupSeen(storyIds, isSeen);

						return (
							<div key={group.userId} className="fixora-pp-story">
								<button
									type="button"
									className={`fixora-pp-story__ring${seen ? ' fixora-pp-story__ring--seen' : ''}`}
									onClick={() => setViewer({ groupIndex, storyIndex: 0 })}
								>
									<span className="fixora-pp-story__ring-inner">
										{cover ? (
											<img className="fixora-pp-story__cover" src={cover} alt="" />
										) : (
											<span className="fixora-pp-story__icon">
												<BoltOutlined style={{ fontSize: 24 }} />
											</span>
										)}
										{!seen && <span className="fixora-pp-story__badge" />}
									</span>
								</button>
								<span
									className={`fixora-pp-story__label${seen ? ' fixora-pp-story__label--seen' : ''}`}
								>
									{truncateLabel(group.owner.name)}
								</span>
							</div>
						);
					})}
				</div>
			</div>

			{activeGroup && viewer && (
				<StoryViewerModal
					stories={activeGroup.stories}
					initialIndex={viewer.storyIndex}
					owner={activeGroup.owner}
					mode="interactive"
					onClose={() => setViewer(null)}
					onStorySeen={markSeenHandler}
				/>
			)}
		</section>
	);
};

export default HomepageStoriesCarousel;
