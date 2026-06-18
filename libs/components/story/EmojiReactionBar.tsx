import React, { useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { SEND_MESSAGE } from '../../../apollo/user/message';
import { userVar } from '../../../apollo/store';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';

export const STORY_REACTION_EMOJIS = ['❤️', '🔥', '😍', '👏', '😮', '😂'] as const;

interface EmojiReactionBarProps {
	receiverId: string;
	storyId: string;
}

const EmojiReactionBar = ({ receiverId, storyId }: EmojiReactionBarProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [sendMessage, { loading }] = useMutation(SEND_MESSAGE);
	const [floatingEmoji, setFloatingEmoji] = useState<string | null>(null);

	const reactHandler = async (emoji: string) => {
		if (!user?._id) {
			const returnUrl = encodeURIComponent(router.asPath);
			await router.push(`/login?returnUrl=${returnUrl}`);
			return;
		}
		if (user._id === receiverId || loading) return;

		try {
			setFloatingEmoji(emoji);
			await sendMessage({
				variables: {
					input: {
						receiverId,
						messageContent: emoji,
						messageType: 'TEXT',
					},
				},
			});
			await sweetTopSmallSuccessAlert(t('story.reaction.sent'), 1200);
			setTimeout(() => setFloatingEmoji(null), 900);
		} catch (err) {
			setFloatingEmoji(null);
			await sweetErrorHandling(err);
		}
	};

	return (
		<div className="fixora-story-viewer__reactions" data-story-id={storyId}>
			{STORY_REACTION_EMOJIS.map((emoji) => (
				<button
					key={emoji}
					type="button"
					className="fixora-story-viewer__reaction-btn"
					onClick={() => reactHandler(emoji)}
					disabled={loading}
					aria-label={t('story.reaction.send', { emoji })}
				>
					{emoji}
				</button>
			))}
			{floatingEmoji && (
				<span className="fixora-story-viewer__reaction-float" aria-hidden="true">
					{floatingEmoji}
				</span>
			)}
		</div>
	);
};

export default EmojiReactionBar;
