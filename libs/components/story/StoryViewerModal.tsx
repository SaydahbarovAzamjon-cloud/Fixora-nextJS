import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import CloseRounded from '@mui/icons-material/CloseRounded';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import RemoveRedEyeOutlined from '@mui/icons-material/RemoveRedEyeOutlined';
import { useTranslation } from 'next-i18next';
import { INCREMENT_STORY_VIEW } from '../../../apollo/user/story';
import { Story } from '../../types/fixora/fixora';
import { sortedStoryImages, storyImageUrl } from './storyImageUrl';
import { markStorySeen } from './storySeenStorage';
import StoryViewerFooter from './StoryViewerFooter';

const FRAME_DURATION_MS = 5000;

export type StoryViewerMode = 'preview' | 'interactive';

export interface StoryViewerOwner {
	id: string;
	name: string;
	avatar?: string;
}

interface StoryViewerModalProps {
	stories: Story[];
	initialIndex: number;
	owner: StoryViewerOwner;
	mode: StoryViewerMode;
	onClose: () => void;
	onStorySeen?: (storyId: string) => void;
}

const initialsOf = (value: string): string => {
	const parts = value.trim().split(/\s+/);
	return ((parts[0]?.[0] || '?') + (parts[1]?.[0] || parts[0]?.[1] || '')).toUpperCase();
};

const formatStoryTime = (value?: string): string => {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	const diffMs = Date.now() - date.getTime();
	const mins = Math.floor(diffMs / 60000);
	if (mins < 1) return 'Just now';
	if (mins < 60) return `${mins}m ago`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs}h ago`;
	return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const StoryViewerModal = ({ stories, initialIndex, owner, mode, onClose, onStorySeen }: StoryViewerModalProps) => {
	const { t } = useTranslation('common');
	const [storyIndex, setStoryIndex] = useState(initialIndex);
	const [frameIndex, setFrameIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const [progress, setProgress] = useState(0);
	const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const viewedRef = useRef<Set<string>>(new Set());

	const [incrementStoryView] = useMutation(INCREMENT_STORY_VIEW);

	const story = stories[storyIndex];
	const frames = sortedStoryImages(story?.images ?? []);
	const frame = frames[frameIndex];
	const frameUrl = frame ? storyImageUrl(frame.url) : '';
	const viewCount = story?._id ? (viewCounts[story._id] ?? story.viewCount ?? 0) : 0;

	const recordView = useCallback(
		async (storyId: string) => {
			if (viewedRef.current.has(storyId)) return;
			viewedRef.current.add(storyId);
			markStorySeen(storyId);
			onStorySeen?.(storyId);
			try {
				const { data } = await incrementStoryView({ variables: { storyId } });
				const next = data?.incrementStoryView?.viewCount;
				if (typeof next === 'number') {
					setViewCounts((prev) => ({ ...prev, [storyId]: next }));
				}
			} catch {
				/* view count is best-effort */
			}
		},
		[incrementStoryView, onStorySeen],
	);

	useEffect(() => {
		const initial: Record<string, number> = {};
		stories.forEach((s) => {
			if (s._id) initial[s._id] = s.viewCount ?? 0;
		});
		setViewCounts(initial);
	}, [stories]);

	useEffect(() => {
		setStoryIndex(initialIndex);
	}, [initialIndex]);

	useEffect(() => {
		if (!story?._id) return;
		setFrameIndex(0);
		setProgress(0);
		recordView(story._id);
	}, [story?._id, recordView]);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', onKeyDown);
		document.body.style.overflow = 'hidden';
		return () => {
			window.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = '';
		};
	}, [onClose]);

	const goNextStory = useCallback(() => {
		if (storyIndex < stories.length - 1) {
			setStoryIndex((i) => i + 1);
		} else {
			onClose();
		}
	}, [storyIndex, stories.length, onClose]);

	const goPrevStory = useCallback(() => {
		if (storyIndex > 0) setStoryIndex((i) => i - 1);
	}, [storyIndex]);

	const goNextFrame = useCallback(() => {
		if (frameIndex < frames.length - 1) {
			setFrameIndex((f) => f + 1);
		} else {
			goNextStory();
		}
	}, [frameIndex, frames.length, goNextStory]);

	const goPrevFrame = useCallback(() => {
		if (frameIndex > 0) setFrameIndex((f) => f - 1);
	}, [frameIndex]);

	useEffect(() => {
		setProgress(0);
		if (intervalRef.current) clearInterval(intervalRef.current);
		if (paused || !frames.length) return;

		const start = Date.now();
		intervalRef.current = setInterval(() => {
			const elapsed = Date.now() - start;
			const pct = Math.min((elapsed / FRAME_DURATION_MS) * 100, 100);
			setProgress(pct);
			if (pct >= 100) {
				if (intervalRef.current) clearInterval(intervalRef.current);
				goNextFrame();
			}
		}, 30);

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [frameIndex, paused, storyIndex, frames.length, goNextFrame]);

	if (!story || !frames.length) return null;

	const showViewCount = mode === 'preview';

	return (
		<div className="fixora-story-viewer" role="dialog" aria-modal="true" aria-label={t('story.viewer.title')}>
			<div className="fixora-story-viewer__backdrop" onClick={onClose} />

			{storyIndex > 0 && (
				<button type="button" className="fixora-story-viewer__nav fixora-story-viewer__nav--prev" onClick={goPrevStory} aria-label={t('story.viewer.prevStory')}>
					<ChevronLeftRounded />
				</button>
			)}
			{storyIndex < stories.length - 1 && (
				<button type="button" className="fixora-story-viewer__nav fixora-story-viewer__nav--next" onClick={goNextStory} aria-label={t('story.viewer.nextStory')}>
					<ChevronRightRounded />
				</button>
			)}

			<div className="fixora-story-viewer__card" onClick={(e) => e.stopPropagation()}>
				{frameUrl && <img className="fixora-story-viewer__media" src={frameUrl} alt="" />}
				<div className="fixora-story-viewer__overlay" />

				<div className="fixora-story-viewer__progress">
					{frames.map((_, i) => (
						<div key={i} className="fixora-story-viewer__progress-seg">
							<div
								className="fixora-story-viewer__progress-fill"
								style={{
									width: i < frameIndex ? '100%' : i === frameIndex ? `${progress}%` : '0%',
								}}
							/>
						</div>
					))}
				</div>

				<div className="fixora-story-viewer__header">
					<div className="fixora-story-viewer__avatar">
						{owner.avatar ? <img src={owner.avatar} alt="" /> : initialsOf(owner.name)}
					</div>
					<div className="fixora-story-viewer__meta">
						<div className="fixora-story-viewer__name">{owner.name}</div>
						<div className="fixora-story-viewer__time">{formatStoryTime(story.createdAt)}</div>
					</div>
					{showViewCount && (
						<div className="fixora-story-viewer__views" title={t('story.viewer.viewCount')}>
							<RemoveRedEyeOutlined style={{ fontSize: 14 }} />
							<span>{viewCount}</span>
						</div>
					)}
					<div className="fixora-story-viewer__controls">
						<button type="button" className="fixora-story-viewer__ctrl" onClick={() => setPaused((p) => !p)} aria-label={paused ? t('story.viewer.play') : t('story.viewer.pause')}>
							{paused ? <PlayArrowRounded fontSize="small" /> : <PauseRounded fontSize="small" />}
						</button>
						<button type="button" className="fixora-story-viewer__ctrl" onClick={onClose} aria-label={t('story.viewer.close')}>
							<CloseRounded fontSize="small" />
						</button>
					</div>
				</div>

				<div className="fixora-story-viewer__content">
					{story.caption && <p className="fixora-story-viewer__caption">{story.caption}</p>}
				</div>

				<StoryViewerFooter receiverId={owner.id} storyId={story._id} />

				<button type="button" className="fixora-story-viewer__tap fixora-story-viewer__tap--prev" onClick={goPrevFrame} aria-hidden="true" tabIndex={-1} />
				<button type="button" className="fixora-story-viewer__tap fixora-story-viewer__tap--next" onClick={goNextFrame} aria-hidden="true" tabIndex={-1} />
			</div>
		</div>
	);
};

export default StoryViewerModal;
