import { beforeEach, describe, expect, it } from 'vitest';
import {
	hasRealProfileImage,
	isLocalUploadedProfileImage,
	resolvePreferredProfileImage,
	resolveProfileImageUrl,
} from './profileImage';
import { userVar } from '../../apollo/store';
import {
	readStoredProfileImage,
	syncUserVarFromGraphqlUser,
	writeStoredProfileImage,
} from '../auth/syncUserVar';
import { updateUserInfo } from '../auth/userInfo';

const GOOGLE_AVATAR = 'https://lh3.googleusercontent.com/a/old-gmail-face';
const FIXORA_UPLOAD = 'uploads/member/new-beanie-photo.jpg';
const USER_ID = 'client-user-1';

/** Same resolution path Top.tsx uses for the navbar avatar. */
function resolveNavAvatarPath(opts: {
	profileDraft?: string | null;
	memberImage?: string | null;
	storedAvatar?: string | null;
}): string {
	const { profileDraft, memberImage, storedAvatar } = opts;
	return (
		profileDraft ||
		resolvePreferredProfileImage(
			hasRealProfileImage(memberImage) ? memberImage : null,
			storedAvatar,
		)
	);
}

describe('client profile image → navbar sync', () => {
	beforeEach(() => {
		localStorage.clear();
		userVar({
			_id: USER_ID,
			memberType: 'USER',
			memberStatus: '',
			memberAuthType: '',
			memberPhone: '',
			memberNick: 'azam',
			memberFullName: 'Saydahbarov Azamjon',
			memberImage: GOOGLE_AVATAR,
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
	});

	it('prefers Fixora upload over Google CDN', () => {
		expect(resolvePreferredProfileImage(GOOGLE_AVATAR, FIXORA_UPLOAD)).toBe(FIXORA_UPLOAD);
		expect(isLocalUploadedProfileImage(FIXORA_UPLOAD)).toBe(true);
		expect(isLocalUploadedProfileImage(GOOGLE_AVATAR)).toBe(false);
	});

	it('navbar uses stored upload when memberImage is still Google (bug repro)', () => {
		writeStoredProfileImage(USER_ID, FIXORA_UPLOAD);
		const stored = readStoredProfileImage(USER_ID);
		const path = resolveNavAvatarPath({
			memberImage: GOOGLE_AVATAR,
			storedAvatar: stored,
		});
		expect(path).toBe(FIXORA_UPLOAD);
		expect(resolveProfileImageUrl(path)).toContain(FIXORA_UPLOAD);
	});

	it('navbar uses draft immediately while uploading', () => {
		const draft = 'blob:http://localhost/preview-123';
		const path = resolveNavAvatarPath({
			profileDraft: draft,
			memberImage: GOOGLE_AVATAR,
			storedAvatar: null,
		});
		expect(path).toBe(draft);
	});

	it('syncUserVarFromGraphqlUser writes Fixora upload into userVar + storage', () => {
		syncUserVarFromGraphqlUser({
			_id: USER_ID,
			userProfileImage: FIXORA_UPLOAD,
		});
		expect(userVar().memberImage).toBe(FIXORA_UPLOAD);
		expect(readStoredProfileImage(USER_ID)).toBe(FIXORA_UPLOAD);
	});

	it('after save, navbar matches My Page even if JWT still has Google', () => {
		// Simulate My Page persistPendingPhoto
		writeStoredProfileImage(USER_ID, FIXORA_UPLOAD);
		syncUserVarFromGraphqlUser({ _id: USER_ID, userProfileImage: FIXORA_UPLOAD });

		const myPageHeader = resolvePreferredProfileImage(FIXORA_UPLOAD, readStoredProfileImage(USER_ID));
		const navPath = resolveNavAvatarPath({
			memberImage: userVar().memberImage,
			storedAvatar: readStoredProfileImage(USER_ID),
		});

		expect(myPageHeader).toBe(FIXORA_UPLOAD);
		expect(navPath).toBe(FIXORA_UPLOAD);
		expect(navPath).toBe(myPageHeader);
	});

	it('updateUserInfo does not overwrite stored Fixora upload with stale Google JWT', () => {
		writeStoredProfileImage(USER_ID, FIXORA_UPLOAD);
		userVar({ ...userVar(), memberImage: FIXORA_UPLOAD });

		// Minimal JWT payload (base64url) with Google avatar still in claims
		const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
		const payload = Buffer.from(
			JSON.stringify({
				_id: USER_ID,
				userType: 'USER',
				userProfileImage: GOOGLE_AVATAR,
				memberImage: GOOGLE_AVATAR,
			}),
		).toString('base64url');
		const jwt = `${header}.${payload}.sig`;

		const ok = updateUserInfo(jwt);
		expect(ok).toBe(true);
		expect(userVar().memberImage).toBe(FIXORA_UPLOAD);

		const navPath = resolveNavAvatarPath({
			memberImage: userVar().memberImage,
			storedAvatar: readStoredProfileImage(USER_ID),
		});
		expect(navPath).toBe(FIXORA_UPLOAD);
	});
});
