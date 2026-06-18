import React from 'react';
import EmojiReactionBar from './EmojiReactionBar';
import StoryReplyInput from './StoryReplyInput';

interface StoryViewerFooterProps {
	receiverId: string;
	storyId: string;
}

const StoryViewerFooter = ({ receiverId, storyId }: StoryViewerFooterProps) => (
	<div className="fixora-story-viewer__footer">
		<EmojiReactionBar receiverId={receiverId} storyId={storyId} />
		<StoryReplyInput receiverId={receiverId} storyId={storyId} />
	</div>
);

export default StoryViewerFooter;
