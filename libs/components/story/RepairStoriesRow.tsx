import React, { useCallback, useState } from 'react';
import AddRounded from '@mui/icons-material/AddRounded';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import { useTranslation } from 'next-i18next';
import CreateStoryModal from '../technician/CreateStoryModal';
import StoryViewerModal, { StoryViewerMode, StoryViewerOwner } from './StoryViewerModal';
import { Story } from '../../types/fixora/fixora';
import { storyImageUrl } from './storyImageUrl';
import { isStorySeen, markStorySeen } from './storySeenStorage';

const STORY_LABEL_MAX = 18;

const formatStoryLabel = (story: Story): string => {
	const caption = story.caption?.trim();
	if (caption) {
		return caption.length > STORY_LABEL_MAX ? `${caption.slice(0, STORY_LABEL_MAX)}…` : caption;
	}
	if (!story.createdAt) return '';
	const date = new Date(story.createdAt);
	if (Number.isNaN(date.getTime())) return '';
	return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

interface RepairStoriesRowProps {
	stories: Story[];
	owner: StoryViewerOwner;
	mode: StoryViewerMode;
	canCreateStory?: boolean;
	onStoriesChange?: () => void;
	/** Card wrapper — technician profile uses true */
	wrapped?: boolean;
	className?: string;
}

const RepairStoriesRow = ({
	stories,
	owner,
	mode,
	canCreateStory = false,
	onStoriesChange,
	wrapped = true,
	className = '',
}: RepairStoriesRowProps) => {
	const { t } = useTranslation('common');
	const [storyModalOpen, setStoryModalOpen] = useState(false);
	const [viewerIndex, setViewerIndex] = useState<number | null>(null);
	const [seenIds, setSeenIds] = useState<Set<string>>(() => new Set());

	const openStoryHandler = (index: number) => setViewerIndex(index);
	const closeViewerHandler = () => setViewerIndex(null);

	const markSeenHandler = useCallback((storyId: string) => {
		markStorySeen(storyId);
		setSeenIds((prev) => new Set(prev).add(storyId));
	}, []);

	const content = (
		<>
			<div className="fixora-pp-stories">
				{canCreateStory && (
					<div className="fixora-pp-story">
						<button className="fixora-pp-story__add" type="button" onClick={() => setStoryModalOpen(true)}>
							<AddRounded style={{ fontSize: 24 }} />
						</button>
						<span className="fixora-pp-story__label fixora-pp-story__label--add">{t('story.add')}</span>
					</div>
				)}
				{stories.map((s, i) => {
					const seen = seenIds.has(s._id) || isStorySeen(s._id);
					const cover = storyImageUrl(s.images?.[0]?.url);
					const label = formatStoryLabel(s);
					return (
						<div key={s._id} className="fixora-pp-story">
							<button
								className={`fixora-pp-story__ring${seen ? ' fixora-pp-story__ring--seen' : ''}`}
								type="button"
								onClick={() => openStoryHandler(i)}
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
							<span className={`fixora-pp-story__label${seen ? ' fixora-pp-story__label--seen' : ''}`}>{label}</span>
						</div>
					);
				})}
				{!canCreateStory && stories.length === 0 && (
					<span className="fixora-pp-stories__empty">{t('story.empty')}</span>
				)}
			</div>

			{canCreateStory && (
				<CreateStoryModal
					open={storyModalOpen}
					onClose={() => setStoryModalOpen(false)}
					onCreated={() => onStoriesChange?.()}
				/>
			)}

			{viewerIndex !== null && stories.length > 0 && (
				<StoryViewerModal
					stories={stories}
					initialIndex={viewerIndex}
					owner={owner}
					mode={mode}
					onClose={closeViewerHandler}
					onStorySeen={markSeenHandler}
				/>
			)}
		</>
	);

	if (!wrapped) {
		return <div className={className}>{content}</div>;
	}

	return (
		<div className={`fixora-pp-stories-card ${className}`.trim()}>
			<div className="fixora-pp-stories-card__head">
				<h2 className="fixora-pp-stories-card__title">{t('story.title')}</h2>
				<div className="fixora-pp-stories-card__live">
					<span className="fixora-pp-stories-card__live-dot" /> {t('story.livePortfolio')}
				</div>
			</div>
			{content}
		</div>
	);
};

export default RepairStoriesRow;
