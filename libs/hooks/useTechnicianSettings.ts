import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { UPDATE_TECHNICIAN_SETTINGS } from '../../apollo/user/settings';
import { GET_USER } from '../../apollo/user/query';
import { profileImageDraftVar, userVar } from '../../apollo/store';
import { getJwtToken, setJwtToken, updateStorage, updateUserInfo } from '../auth';
import { settingsUserFromAuth } from '../auth/settingsUserFallback';
import { syncUserVarFromGraphqlUser } from '../auth/syncUserVar';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../sweetAlert';
import { useTranslation } from 'next-i18next';

export interface TechnicianSettingsUser {
	_id: string;
	userEmail?: string | null;
	userFullName?: string | null;
	userNickname?: string | null;
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

export function useTechnicianSettings(userId?: string) {
	const { t } = useTranslation('technician');
	const authUser = useReactiveVar(userVar);
	const { data, loading, error, refetch } = useQuery(GET_USER, {
		variables: { userId: userId! },
		skip: !userId,
		fetchPolicy: 'cache-and-network',
		errorPolicy: 'all',
	});

	const [updateUser, { loading: saving }] = useMutation(UPDATE_TECHNICIAN_SETTINGS);

	const graphqlUser: TechnicianSettingsUser | null = data?.getUser ?? null;
	const user: TechnicianSettingsUser | null = graphqlUser ?? settingsUserFromAuth(authUser);
	const offline = !!error && !graphqlUser && !!user;

	const [profileForm, setProfileForm] = useState<ProfileFormState>({
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
			fullName: next.userFullName ?? '',
			email: next.userEmail ?? '',
			phone: next.userPhoneNumber ?? '',
			location: next.userLocation ?? '',
			bio: next.userBio ?? '',
		});
		setNickname(next.userNickname ?? '');
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
			if (!userId) return false;
			try {
				const result = await updateUser({
					variables: { input: { _id: userId, ...input } },
					refetchQueries: [{ query: GET_USER, variables: { userId } }],
					awaitRefetchQueries: true,
				});
				const updated = result.data?.updateUser;

				if (updated?.accessToken) {
					setJwtToken(updated.accessToken);
					updateStorage({ jwtToken: updated.accessToken });
				}

				const refetchResult = await refetch();
				const refreshed = refetchResult.data?.getUser as TechnicianSettingsUser | undefined;

				// GraphQL getUser is source of truth; merge saved input so UI updates even if cache lags.
				const profileSource = refreshed ?? updated;
				if (profileSource) {
					syncUserVarFromGraphqlUser({
						...profileSource,
						...(input.userFullName !== undefined
							? { userFullName: String(input.userFullName) }
							: {}),
						...(input.userNickname !== undefined
							? { userNickname: String(input.userNickname) }
							: {}),
						...(input.userProfileImage !== undefined
							? { userProfileImage: (input.userProfileImage as string | null) ?? null }
							: {}),
						...(input.userPhoneNumber !== undefined
							? { userPhoneNumber: String(input.userPhoneNumber) }
							: {}),
						...(input.userBio !== undefined ? { userBio: String(input.userBio) } : {}),
					});
					syncProfileFormFromUser({
						...(profileSource as TechnicianSettingsUser),
						...(input.userFullName !== undefined
							? { userFullName: String(input.userFullName) }
							: {}),
						...(input.userPhoneNumber !== undefined
							? { userPhoneNumber: String(input.userPhoneNumber) }
							: {}),
						...(input.userLocation !== undefined
							? { userLocation: String(input.userLocation) }
							: {}),
						...(input.userBio !== undefined ? { userBio: String(input.userBio) } : {}),
						...(input.userProfileImage !== undefined
							? { userProfileImage: (input.userProfileImage as string | null) ?? null }
							: {}),
					});
				} else if (updated?.accessToken) {
					updateUserInfo(updated.accessToken);
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
		[refetch, syncProfileFormFromUser, updateUser, userId],
	);

	const saveProfile = useCallback(
		async (profileImagePath?: string) => {
			const emailChanged =
				!!user?.userEmail &&
				profileForm.email.trim().toLowerCase() !== user.userEmail.trim().toLowerCase();

			const input: Record<string, unknown> = {
				userFullName: profileForm.fullName.trim(),
				userPhoneNumber: profileForm.phone.trim(),
				userLocation: profileForm.location.trim(),
				userBio: profileForm.bio.trim(),
			};
			if (profileImagePath !== undefined) {
				input.userProfileImage = profileImagePath || null;
			}

			const ok = await saveUpdate(input, t('settings.profile.saved'));
			if (ok && emailChanged) {
				await sweetMixinErrorAlert(t('settings.profile.emailChangePending'));
				setProfileForm((prev) => ({ ...prev, email: user?.userEmail ?? prev.email }));
			}
			return ok;
		},
		[profileForm, saveUpdate, t, user?.userEmail],
	);

	const saveAccount = useCallback(async () => {
		return saveUpdate({ userNickname: nickname.trim() }, 'Account saved.');
	}, [nickname, saveUpdate]);

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
		async (newPassword: string) => {
			return saveUpdate({ userPassword: newPassword }, 'Password updated.');
		},
		[saveUpdate],
	);

	return {
		user,
		loading,
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
