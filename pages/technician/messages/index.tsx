import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import CallOutlined from '@mui/icons-material/CallOutlined';
import VideocamOutlined from '@mui/icons-material/VideocamOutlined';
import MoreHorizOutlined from '@mui/icons-material/MoreHorizOutlined';
import SmartphoneOutlined from '@mui/icons-material/SmartphoneOutlined';
import AttachFileOutlined from '@mui/icons-material/AttachFileOutlined';
import SentimentSatisfiedAltOutlined from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import SendRounded from '@mui/icons-material/SendRounded';
import DoneAllRounded from '@mui/icons-material/DoneAllRounded';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

interface Message {
	from: 'in' | 'out';
	text: string;
	time: string;
}

interface Conversation {
	id: number;
	name: string;
	initials: string;
	online: boolean;
	time: string;
	unread: number;
	preview: string;
	code: string;
	device: string;
	messages: Message[];
}

const CONVERSATIONS: Conversation[] = [
	{
		id: 1,
		name: 'Sarah Mitchell',
		initials: 'SM',
		online: true,
		time: '2m',
		unread: 2,
		preview: 'Yes, I can bring it in tomorrow mor…',
		code: 'REQ-1042',
		device: 'iPhone 15 Pro Max',
		messages: [
			{ from: 'out', text: 'Hey Sarah! Yes, absolutely. We handle iPhone 15 Pro Max screen replacements. We use genuine OLED displays.', time: '10:15 AM' },
			{ from: 'in', text: "Great! How long would it take and what's the price?", time: '10:16 AM' },
			{ from: 'out', text: 'Screen replacement for the 15 Pro Max takes about 1.5–2 hours. Price is $180 including a 90-day warranty on the repair.', time: '10:18 AM' },
			{ from: 'in', text: 'That sounds good! When can I come in?', time: '10:22 AM' },
			{ from: 'out', text: 'I have slots available tomorrow from 9AM–12PM and 2PM–6PM. Which works better for you?', time: '10:24 AM' },
			{ from: 'in', text: 'Yes, I can bring it in tomorrow morning around 9am', time: '10:31 AM' },
		],
	},
	{
		id: 2,
		name: 'Daniel Wagner',
		initials: 'DW',
		online: true,
		time: '15m',
		unread: 1,
		preview: 'Is my phone ready? Any updates o…',
		code: 'JOB-882',
		device: 'iPhone 14 Plus',
		messages: [{ from: 'in', text: 'Is my phone ready? Any updates on the water damage recovery?', time: '15m' }],
	},
	{
		id: 3,
		name: 'Anna Schulz',
		initials: 'AS',
		online: false,
		time: '1h',
		unread: 0,
		preview: "Thanks for the update! I'll wait for your m…",
		code: 'JOB-881',
		device: 'MacBook Air M2',
		messages: [{ from: 'in', text: "Thanks for the update! I'll wait for your message.", time: '1h' }],
	},
	{
		id: 4,
		name: 'Tom Harrington',
		initials: 'TH',
		online: false,
		time: '3h',
		unread: 0,
		preview: 'The parts have arrived. Repair will start t…',
		code: 'JOB-880',
		device: 'iPhone 13 mini',
		messages: [{ from: 'in', text: 'The parts have arrived. Repair will start today.', time: '3h' }],
	},
	{
		id: 5,
		name: 'Lily Chen',
		initials: 'LC',
		online: false,
		time: '5h',
		unread: 0,
		preview: 'Your iPad is ready for pickup! Come any…',
		code: 'JOB-879',
		device: 'iPad Pro 12.9"',
		messages: [{ from: 'in', text: 'Your iPad is ready for pickup! Come anytime.', time: '5h' }],
	},
];

const nowTime = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const Messages: NextPage = () => {
	const [search, setSearch] = useState('');
	const [selectedId, setSelectedId] = useState<number>(1);
	const [threads, setThreads] = useState<Record<number, Message[]>>(
		() => Object.fromEntries(CONVERSATIONS.map((c) => [c.id, c.messages]))
	);
	const [draft, setDraft] = useState('');

	const conversations = useMemo(
		() => CONVERSATIONS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
		[search]
	);

	const active = useMemo(() => CONVERSATIONS.find((c) => c.id === selectedId) ?? CONVERSATIONS[0], [selectedId]);
	const activeMessages = threads[active.id] ?? [];

	const sendMessage = () => {
		const text = draft.trim();
		if (!text) return;
		setThreads((prev) => ({
			...prev,
			[active.id]: [...(prev[active.id] ?? []), { from: 'out', text, time: nowTime() }],
		}));
		setDraft('');
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	return (
		<div className="fixora-msg-page">
			{/* Conversation list */}
			<div className="fixora-msg-left">
				<div className="fixora-msg-search-wrap">
					<div className="fixora-msg-search">
						<SearchOutlined style={{ fontSize: 17 }} />
						<input
							type="text"
							placeholder="Search conversations..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>

				<div className="fixora-msg-conv-list">
					{conversations.map((conv) => (
						<button
							key={conv.id}
							className={`fixora-msg-conv ${conv.id === selectedId ? 'fixora-msg-conv--active' : ''}`}
							onClick={() => setSelectedId(conv.id)}
							type="button"
						>
							<div className="fixora-msg-conv__avatar-wrap">
								<div className="fixora-msg-conv__avatar">{conv.initials}</div>
								{conv.online && <span className="fixora-msg-conv__dot" />}
							</div>
							<div className="fixora-msg-conv__body">
								<div className="fixora-msg-conv__row">
									<span className="fixora-msg-conv__name">{conv.name}</span>
									<span className="fixora-msg-conv__meta">
										<span className="fixora-msg-conv__time">{conv.time}</span>
										{conv.unread > 0 && <span className="fixora-msg-conv__unread">{conv.unread}</span>}
									</span>
								</div>
								<div className="fixora-msg-conv__preview">{conv.preview}</div>
								<div className="fixora-msg-conv__code">{conv.code}</div>
							</div>
						</button>
					))}
				</div>
			</div>

			{/* Chat area */}
			<div className="fixora-msg-chat">
				<div className="fixora-msg-chat__header">
					<div className="fixora-msg-conv__avatar-wrap">
						<div className="fixora-msg-chat__avatar">{active.initials}</div>
						{active.online && <span className="fixora-msg-conv__dot" />}
					</div>
					<div className="fixora-msg-chat__head-info">
						<div className="fixora-msg-chat__name">{active.name}</div>
						<div className="fixora-msg-chat__status">
							{active.online && <span className="fixora-msg-chat__status-dot" />}
							{active.online ? 'Online' : 'Offline'} · {active.device}
						</div>
					</div>
					<div className="fixora-msg-chat__actions">
						<button className="fixora-msg-icon-btn" type="button"><CallOutlined style={{ fontSize: 18 }} /></button>
						<button className="fixora-msg-icon-btn" type="button"><VideocamOutlined style={{ fontSize: 19 }} /></button>
						<button className="fixora-msg-icon-btn" type="button"><MoreHorizOutlined style={{ fontSize: 20 }} /></button>
					</div>
				</div>

				<div className="fixora-msg-chat__context">
					<SmartphoneOutlined style={{ fontSize: 16 }} />
					<span>{active.code} — {active.device}</span>
				</div>

				<div className="fixora-msg-chat__body">
					{activeMessages.map((m, i) => (
						<div key={i} className={`fixora-msg-row fixora-msg-row--${m.from}`}>
							{m.from === 'in' && <div className="fixora-msg-row__avatar">{active.initials[0]}</div>}
							<div className="fixora-msg-row__wrap">
								<div className={`fixora-msg-bubble fixora-msg-bubble--${m.from}`}>{m.text}</div>
								<div className="fixora-msg-bubble__meta">
									{m.time}
									{m.from === 'out' && <DoneAllRounded style={{ fontSize: 14 }} />}
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="fixora-msg-composer-wrap">
					<div className="fixora-msg-composer">
						<button className="fixora-msg-composer__attach" type="button"><AttachFileOutlined style={{ fontSize: 18 }} /></button>
						<textarea
							className="fixora-msg-composer__input"
							placeholder="Type a message..."
							rows={1}
							value={draft}
							onChange={(e) => setDraft(e.target.value)}
							onKeyDown={handleKeyDown}
						/>
						<button className="fixora-msg-composer__emoji" type="button"><SentimentSatisfiedAltOutlined style={{ fontSize: 19 }} /></button>
						<button className="fixora-msg-composer__send" type="button" onClick={sendMessage}>
							<SendRounded style={{ fontSize: 18 }} />
						</button>
					</div>
					<div className="fixora-msg-composer__hint">
						Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
					</div>
				</div>
			</div>
		</div>
	);
};

export default withTechnicianLayout(Messages);
