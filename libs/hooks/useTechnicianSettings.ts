import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import {
	CHANGE_PASSWORD,
	GET_TECHNICIAN_SETTINGS,
	UPDATE_EMAIL,
	UPDATE_TECHNICIAN_SETTINGS,
	UPDATE_USER_SLUG,
} from '../../apollo/user/settings';
import { profileImageDraftVar, userVar } from '../../apollo/store';
import { getJwtToken, setJwtToken, updateStorage, updateUserInfo } from '../auth';
import { settingsUserFromAuth } from '../auth/settingsUserFallback';
import {
	mergeTechnicianSettingsCache,
	readTechnicianSettingsCache,
	writeStoredUserEmail,
	writeTechnicianSettingsCache,
} from '../auth/technicianSettingsCache';
import { TECHNICIAN_PORTAL_QUERY_CONTEXT } from '../apollo/technicianQueryContext';
import { resolveAuthUser } from '../utils/authSession';
import { syncUserVarFromGraphqlUser } from '../auth/syncUserVar';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../sweetAlert';
import { useTranslation } from 'next-i18next';
import { useIsClientReady } from './useIsClientReady';

export interface TechnicianSettingsUser {
	_id: string;
	userEmail?: string | null;
	userFullName?: string | null;
	userNickname?: string | null;
	userSlug?: string | null;
	shopName?: string | null;
	userPhoneNumber?: string | null;
	userLocation?: string | null;
	userBio?: string | null;
	userProfileImage?: string | null;
	userType?: string | null;
	badgeLevel?: string | null;
	workingHours?: {
		days?: string[] | null;
		startTime?: string | null;
		endTime?: string | null;
	} | null;
}

export interface ProfileFormState {
	shopName: string;
	fullName: string;
	email: string;
	phone: string;
	location: string;
	bio: string;
}

export interface AvailabilityFormState {
	days: Record<string, boolean>;
	startTime: string;
	endTime: string;
}

export const SETTINGS_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const SETTINGS_HOURS = [
	'8:00 AM',
	'9:00 AM',
	'10:00 AM',
	'11:00 AM',
	'12:00 PM',
	'1:00 PM',
	'2:00 PM',
	'3:00 PM',
	'4:00 PM',
	'5:00 PM',
	'6:00 PM',
	'7:00 PM',
	'8:00 PM',
];

const defaultDays = (): Record<string, boolean> =>
	Object.fromEntries(SETTINGS_DAYS.map((d) => [d, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(d)]));

function mergeSettingsUser(
	graphqlUser: TechnicianSettingsUser | null,
	cachedUser: TechnicianSettingsUser | null,
	authUser: TechnicianSettingsUser | null,
): TechnicianSettingsUser | null {
	return graphqlUser ?? cachedUser ?? authUser;
}

function toSettingsUser(raw: Record<string, unknown> | null | undefined, userId: string): TechnicianSettingsUser | null {
	if (!raw?._id && !userId) return null;
	return {
		_id: String(raw?._id ?? userId),
		userEmail: (raw?.userEmail as string | null | undefined) ?? null,
		userFullName: (raw?.userFullName as string | null | undefined) ?? null,
		userNickname: (raw?.userNickname as string | null | undefined) ?? null,
		userSlug: (raw?.userSlug as string | null | undefined) ?? null,
		shopName: (raw?.shopName as string | null | undefined) ?? null,
		userPhoneNumber: (raw?.userPhoneNumber as string | null | undefined) ?? null,
		userLocation: (raw?.userLocation as string | null | undefined) ?? null,
		userBio: (raw?.userBio as string | null | undefined) ?? null,
		userProfileImage: (raw?.userProfileImage as string | null | undefined) ?? null,
		userType: (raw?.userType as string | null | undefined) ?? null,
		badgeLevel: (raw?.badgeLevel as string | null | undefined) ?? null,
		workingHours: (raw?.workingHours as TechnicianSettingsUser['workingHours']) ?? null,
	};
}

export function useTechnicianSettings(userId?: string) {
	const { t } = useTranslation('technician');
	const isClientReady = useIsClientReady();
	const authUser = useReactiveVar(userVar);
	const sessionUser = authUser?._id ? authUser : isClientReady ? resolveAuthUser() : null;
	const resolvedId = userId || sessionUser?._id;
	const skipQuery = !resolvedId || !isClientReady;

	const { data, loading, error, refetch } = useQuery(GET_TECHNICIAN_SETTINGS, {
		variables: { userId: resolvedId! },
		skip: skipQuery,
		fetchPolicy: 'cache-and-network',
		errorPolicy: 'all',
		context: TECHNICIAN_PORTAL_QUERY_CONTEXT,
	});

	const [updateUser, { loading: saving }] = useMutation(UPDATE_TECHNICIAN_SETTINGS, {
		refetchQueries: ['GetTechnicians'],
	});
	const [changePassword] = useMutation(CHANGE_PASSWORD);
	const [updateEmail] = useMutation(UPDATE_EMAIL);
	const [updateUserSlug] = useMutation(UPDATE_USER_SLUG);

	const graphqlUser = useMemo(
		() => toSettingsUser(data?.getUser as Record<string, unknown> | undefined, resolvedId ?? ''),
		[data?.getUser, resolvedId],
	);

	const cachedUser = useMemo(
		() => (resolvedId ? readTechnicianSettingsCache(resolvedId) : null),
		[resolvedId, graphqlUser],
	);

	const authFallbackUser = useMemo(() => settingsUserFromAuth(sessionUser), [sessionUser]);

	const user = useMemo(
		() => mergeSettingsUser(graphqlUser, cachedUser, authFallbackUser),
		[graphqlUser, cachedUser, authFallbackUser],
	);

	const offline = !!error && !graphqlUser && !!user;

	useEffect(() => {
		if (graphqlUser?._id) writeTechnicianSettingsCache(graphqlUser);
	}, [graphqlUser]);

	const [profileForm, setProfileForm] = useState<ProfileFormState>({
		shopName: '',
		fullName: '',
		email: '',
		phone: '',
		location: '',
		bio: '',
	});
	const [nickname, setNickname] = useState('');
	const [availability, setAvailability] = useState<AvailabilityFormState>({
		days: defaultDays(),
		startTime: '8:00 AM',
		endTime: '6:00 PM',
	});
	const [hydrated, setHydrated] = useState(false);
	const formDirtyRef = useRef(false);
	const lastHydratedUserIdRef = useRef<string | null>(null);
	const hydratedFromGraphqlRef = useRef(false);

	const hydrateFormFromUser = useCallback((next: TechnicianSettingsUser) => {
		setProfileForm({
			shopName: next.shopName ?? '',
			fullName: next.userFullName ?? '',
			email: next.userEmail ?? '',
			phone: next.userPhoneNumber ?? '',
			location: next.userLocation ?? '',
			bio: next.userBio ?? '',
		});
		setNickname(next.userSlug ?? next.userNickname ?? '');
		const wh = next.workingHours;
		const daysState = defaultDays();
		if (wh?.days?.length) {
			SETTINGS_DAYS.forEach((d) => {
				daysState[d] = wh.days!.includes(d);
			});
		}
		setAvailability({
			days: daysState,
			startTime: wh?.startTime || '8:00 AM',
			endTime: wh?.endTime || '6:00 PM',
		});
	}, []);

	const syncProfileFormFromUser = useCallback(
		(next: TechnicianSettingsUser) => {
			hydrateFormFromUser(next);
		},
		[hydrateFormFromUser],
	);

	// Hydrate once from auth cache, then upgrade once when GraphQL arrives — never clobber in-progress edits.
	useEffect(() => {
		if (!user?._id) return;

		if (lastHydratedUserIdRef.current !== user._id) {
			lastHydratedUserIdRef.current = user._id;
			hydratedFromGraphqlRef.current = false;
			formDirtyRef.current = false;
		}

		if (formDirtyRef.current) return;

		if (graphqlUser) {
			if (!hydratedFromGraphqlRef.current) {
				hydrateFormFromUser(graphqlUser);
				hydratedFromGraphqlRef.current = true;
				setHydrated(true);
			}
		} else if (!hydrated) {
			hydrateFormFromUser(user);
			setHydrated(true);
		}
	}, [user, graphqlUser, hydrated, hydrateFormFromUser]);

	const markFormDirty = useCallback(() => {
		formDirtyRef.current = true;
	}, []);

	const patchProfile = useCallback(
		(partial: Partial<ProfileFormState>) => {
			markFormDirty();
			setProfileForm((prev) => ({ ...prev, ...partial }));
		},
		[markFormDirty],
	);

	const setNicknameDirty = useCallback(
		(value: string) => {
			markFormDirty();
			setNickname(value);
		},
		[markFormDirty],
	);

	const patchAvailability = useCallback(
		(partial: Partial<AvailabilityFormState>) => {
			markFormDirty();
			setAvailability((prev) => ({ ...prev, ...partial }));
		},
		[markFormDirty],
	);

	const toggleDay = useCallback(
		(day: string) => {
			markFormDirty();
			setAvailability((prev) => ({
				...prev,
				days: { ...prev.days, [day]: !prev.days[day] },
			}));
		},
		[markFormDirty],
	);

	const saveUpdate = useCallback(
		async (input: Record<string, unknown>, successMessage: string) => {
			if (!resolvedId) return false;
			try {
				const result = await updateUser({
					variables: { input: { _id: resolvedId, ...input } },
					context: TECHNICIAN_PORTAL_QUERY_CONTEXT,
					refetchQueries: [{ query: GET_TECHNICIAN_SETTINGS, variables: { userId: resolvedId } }],
					awaitRefetchQueries: true,
				});
				const updatedRaw = result.data?.updateUser as Record<string, unknown> | undefined;
				const updated = toSettingsUser(updatedRaw, resolvedId);

				if (updatedRaw?.accessToken) {
					setJwtToken(updatedRaw.accessToken as string);
					updateStorage({ jwtToken: updatedRaw.accessToken as string });
				}

				let profileSource: TechnicianSettingsUser | null = null;

				try {
					const refetchResult = await refetch();
					profileSource =
						toSettingsUser(refetchResult.data?.getUser as Record<string, unknown> | undefined, resolvedId) ??
						updated;
				} catch {
					profileSource = updated;
				}

				if (!profileSource && updated) profileSource = updated;

				if (profileSource) {
					const merged = mergeTechnicianSettingsCache(resolvedId, {
						...profileSource,
						...(input.userFullName !== undefined ? { userFullName: String(input.userFullName) } : {}),
						...(input.shopName !== undefined ? { shopName: String(input.shopName) } : {}),
						...(input.userNickname !== undefined ? { userNickname: String(input.userNickname) } : {}),
						...(input.userProfileImage !== undefined
							? { userProfileImage: (input.userProfileImage as string | null) ?? null }
							: {}),
						...(input.userPhoneNumber !== undefined
							? { userPhoneNumber: String(input.userPhoneNumber) }
							: {}),
						...(input.userLocation !== undefined ? { userLocation: String(input.userLocation) } : {}),
						...(input.userBio !== undefined ? { userBio: String(input.userBio) } : {}),
						...(input.workingHours !== undefined
							? { workingHours: input.workingHours as TechnicianSettingsUser['workingHours'] }
							: {}),
					});

					syncUserVarFromGraphqlUser({
						_id: resolvedId,
						userFullName: merged.userFullName,
						userNickname: merged.userNickname,
						userProfileImage: merged.userProfileImage,
						userPhoneNumber: merged.userPhoneNumber,
						userBio: merged.userBio,
					});
					if (merged.userEmail) writeStoredUserEmail(resolvedId, merged.userEmail);
					syncProfileFormFromUser(merged);
				} else if (updatedRaw?.accessToken) {
					updateUserInfo(updatedRaw.accessToken as string);
				} else {
					const token = getJwtToken();
					if (token) updateUserInfo(token);
				}

				if (input.userProfileImage !== undefined) {
					profileImageDraftVar(null);
				}

				formDirtyRef.current = false;
				await sweetTopSmallSuccessAlert(successMessage, 1200);
				return true;
			} catch (err) {
				await sweetErrorHandling(err);
				return false;
			}
		},
		[refetch, resolvedId, syncProfileFormFromUser, updateUser],
	);

	const saveProfile = useCallback(
		async (profileImagePath?: string) => {
			const emailChanged =
				profileForm.email.trim().toLowerCase() !== (user?.userEmail ?? '').trim().toLowerCase();

			const input: Record<string, unknown> = {
				shopName: profileForm.shopName.trim() || null,
				userFullName: profileForm.fullName.trim(),
				userPhoneNumber: profileForm.phone.trim(),
				userLocation: profileForm.location.trim(),
				userBio: profileForm.bio.trim(),
			};
			if (profileImagePath !== undefined) {
				input.userProfileImage = profileImagePath || null;
			}

			if (emailChanged) {
				try {
					const emailResult = await updateEmail({
						variables: { input: { userEmail: profileForm.email.trim() } },
					});
					const newEmail = emailResult.data?.updateEmail?.userEmail;
					if (newEmail && resolvedId) {
						writeStoredUserEmail(resolvedId, newEmail);
						mergeTechnicianSettingsCache(resolvedId, { userEmail: newEmail });
					}
				} catch (err) {
					await sweetErrorHandling(err);
					return false;
				}
			}

			const ok = await saveUpdate(input, t('settings.profile.saved'));
			if (ok && resolvedId) {
				mergeTechnicianSettingsCache(resolvedId, {
					userEmail: profileForm.email.trim(),
					shopName: profileForm.shopName.trim() || null,
					userFullName: profileForm.fullName.trim(),
					userPhoneNumber: profileForm.phone.trim(),
					userLocation: profileForm.location.trim(),
					userBio: profileForm.bio.trim(),
					...(profileImagePath !== undefined ? { userProfileImage: profileImagePath || null } : {}),
				});
				await refetch();
			}
			return ok;
		},
		[profileForm, resolvedId, saveUpdate, t, updateEmail, user?.userEmail, refetch],
	);

	const saveAccount = useCallback(async () => {
		if (!resolvedId) return false;
		const slug = nickname.trim().toLowerCase();
		if (!slug) {
			await sweetMixinErrorAlert(t('settings.account.slugRequired'));
			return false;
		}
		try {
			const emailChanged =
				profileForm.email.trim().toLowerCase() !== (user?.userEmail ?? '').trim().toLowerCase();

			if (emailChanged) {
				await updateEmail({
					variables: { input: { userEmail: profileForm.email.trim() } },
				});
			}

			await updateUserSlug({ variables: { input: { userSlug: slug } } });
			await refetch();
			if (resolvedId) {
				mergeTechnicianSettingsCache(resolvedId, { userSlug: slug });
			}
			formDirtyRef.current = false;
			await sweetTopSmallSuccessAlert(t('settings.account.saved'), 1200);
			return true;
		} catch (err) {
			await sweetErrorHandling(err);
			return false;
		}
	}, [nickname, profileForm.email, refetch, resolvedId, t, updateEmail, updateUserSlug, user?.userEmail]);

	const saveAvailability = useCallback(async () => {
		const selectedDays = SETTINGS_DAYS.filter((d) => availability.days[d]);
		return saveUpdate(
			{
				workingHours: {
					days: selectedDays,
					startTime: availability.startTime,
					endTime: availability.endTime,
				},
			},
			'Availability saved.',
		);
	}, [availability, saveUpdate]);

	const savePassword = useCallback(
		async (currentPassword: string, newPassword: string) => {
			try {
				await changePassword({
					variables: { input: { currentPassword, newPassword } },
				});
				await sweetTopSmallSuccessAlert(t('settings.security.passwordSaved'), 1200);
				return true;
			} catch (err) {
				await sweetErrorHandling(err);
				return false;
			}
		},
		[changePassword, t],
	);

	return {
		user,
		loading: skipQuery || (loading && !user),
		profileReady: hydrated && !!user,
		error: error && !user ? error : undefined,
		offline,
		refetch,
		saving,
		profileForm,
		patchProfile,
		nickname,
		setNickname: setNicknameDirty,
		availability,
		patchAvailability,
		toggleDay,
		saveProfile,
		saveAccount,
		saveAvailability,
		savePassword,
	};
}
