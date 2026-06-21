import { makeVar } from '@apollo/client';

import { CustomJwtPayload } from '../libs/types/customJwtPayload';
export const themeVar = makeVar({});

export const userVar = makeVar<CustomJwtPayload>({
	_id: '',
	memberType: '',
	memberStatus: '',
	memberAuthType: '',
	memberPhone: '',
	memberNick: '',
	memberFullName: '',
	memberImage: '',
	memberAddress: '',
	memberDesc: '',
	memberProperties: 0,
	memberRank: 0,
	memberArticles: 0,
	memberPoints: 0,
	memberLikes: 0,
	memberViews: 0,
	memberWarnings: 0,
	memberBlocks: 0,
});

// @ts-ignore — legacy Nestar chat socket; Fixora realtime uses fixoraWebSocket.ts
export const socketVar = makeVar<WebSocket | null>(null);

/** True when Fixora auth WebSocket is open (see libs/utils/fixoraWebSocket.ts). */
export const fixoraWsConnectedVar = makeVar(false);

/** Temporary blob URL for profile photo preview before Save (settings). */
export const profileImageDraftVar = makeVar<string | null>(null);
