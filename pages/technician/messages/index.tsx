import React, { useState } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

const Messages: NextPage = () => {
	const [search, setSearch] = useState('');

	const conversations = [
		{ id: 1, name: 'Sarah Johnson', message: 'My phone is ready for pickup!', unread: 1, time: '2m', avatar: 'SJ' },
		{ id: 2, name: 'Michael Chen', message: 'Thanks for the quick repair', unread: 0, time: '1h', avatar: 'MC' },
		{ id: 3, name: 'Emma Williams', message: 'Can you check the water damage...', unread: 2, time: '3h', avatar: 'EW' },
		{ id: 4, name: 'James Smith', message: 'Perfect! Will come by tomorrow', unread: 0, time: '1d', avatar: 'JS' },
	];

	return (
		<div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
			{/* Chat List */}
			<div style={{
				width: '360px',
				borderRight: '1px solid rgba(255,255,255,0.07)',
				display: 'flex',
				flexDirection: 'column',
				background: '#0D0D0D',
				padding: '16px'
			}}>
				<input
					type="text"
					placeholder="Search conversations..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					style={{
						background: '#1A1A1A',
						border: '1px solid rgba(255,255,255,0.08)',
						borderRadius: '10px',
						padding: '9px 12px',
						color: '#E0E0E0',
						marginBottom: '12px',
						fontSize: '13px'
					}}
				/>

				<div style={{ flex: 1, overflowY: 'auto' }}>
					{conversations.map((conv) => (
						<div key={conv.id} style={{
							padding: '12px',
							borderRadius: '10px',
							marginBottom: '6px',
							background: 'rgba(255,107,0,0.08)',
							border: '1px solid rgba(255,107,0,0.2)',
							cursor: 'pointer',
							transition: 'all 0.15s ease'
						}}>
							<div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
								<div style={{
									width: 40,
									height: 40,
									borderRadius: 8,
									background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#fff',
									fontWeight: 700,
									fontSize: 12,
									flexShrink: 0
								}}>
									{conv.avatar}
								</div>
								<div style={{ flex: 1, minWidth: 0 }}>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
										<div style={{ color: '#E0E0E0', fontSize: 13, fontWeight: 600 }}>{conv.name}</div>
										<div style={{ color: '#606060', fontSize: 11 }}>{conv.time}</div>
									</div>
									<div style={{ color: '#808080', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
										{conv.message}
									</div>
									{conv.unread > 0 && (
										<div style={{
											display: 'inline-block',
											background: '#FF6B00',
											color: '#fff',
											borderRadius: 10,
											padding: '2px 6px',
											fontSize: 10,
											fontWeight: 700,
											marginTop: 6
										}}>
											{conv.unread}
										</div>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Chat Area */}
			<div style={{
				flex: 1,
				background: '#0A0A0A',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}>
				<div style={{ textAlign: 'center', color: '#606060' }}>
					<div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
					<div style={{ fontSize: 14, fontWeight: 600, color: '#E0E0E0', marginBottom: 4 }}>Select a conversation</div>
					<div style={{ fontSize: 13 }}>Pick a chat to start messaging</div>
				</div>
			</div>
		</div>
	);
};

export default withTechnicianLayout(Messages);
