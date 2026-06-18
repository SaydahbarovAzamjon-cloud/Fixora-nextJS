import React, { useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import SendRounded from '@mui/icons-material/SendRounded';
import { SEND_MESSAGE } from '../../../apollo/user/message';
import { userVar } from '../../../apollo/store';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface StoryReplyInputProps {
	receiverId: string;
	storyId: string;
	onSent?: () => void;
}

const StoryReplyInput = ({ receiverId, storyId, onSent }: StoryReplyInputProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [text, setText] = useState('');
	const [sendMessage, { loading }] = useMutation(SEND_MESSAGE);

	const sendHandler = async (e?: React.FormEvent) => {
		e?.preventDefault();
		const trimmed = text.trim();
		if (!trimmed || loading) return;

		if (!user?._id) {
			const returnUrl = encodeURIComponent(router.asPath);
			await router.push(`/login?returnUrl=${returnUrl}`);
			return;
		}
		if (user._id === receiverId) return;

		try {
			await sendMessage({
				variables: {
					input: {
						receiverId,
						messageContent: trimmed,
						messageType: 'TEXT',
					},
				},
			});
			setText('');
			await sweetTopSmallSuccessAlert(t('story.reply.sent'), 1200);
			onSent?.();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<form className="fixora-story-viewer__reply" onSubmit={sendHandler} data-story-id={storyId}>
			<input
				type="text"
				className="fixora-story-viewer__reply-input"
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder={t('story.reply.placeholder')}
				maxLength={500}
				disabled={loading}
			/>
			<button
				type="submit"
				className="fixora-story-viewer__reply-send"
				disabled={!text.trim() || loading}
				aria-label={t('story.reply.send')}
			>
				<SendRounded fontSize="small" />
			</button>
		</form>
	);
};

export default StoryReplyInput;
