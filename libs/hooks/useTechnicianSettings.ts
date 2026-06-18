import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_TECHNICIAN_SETTINGS, UPDATE_TECHNICIAN_SETTINGS } from '../../apollo/user/settings';
import { getJwtToken, updateUserInfo } from '../auth';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../sweetAlert';

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
	const { data, loading, error, refetch } = useQuery(GET_TECHNICIAN_SETTINGS, {
		variables: { userId: userId! },
		skip: !userId,
		fetchPolicy: 'cache-and-network',
	});

	const [updateUser, { loading: saving }] = useMutation(UPDATE_TECHNICIAN_SETTINGS);

	const user: TechnicianSettingsUser | null = data?.getUser ?? null;

	const [profileForm, setProfileForm] = useState<ProfileFormState>({
		fullName: '',
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

	useEffect(() => {
		if (!user || hydrated) return;
		setProfileForm({
			fullName: user.userFullName ?? '',
			phone: user.userPhoneNumber ?? '',
			location: user.userLocation ?? '',
			bio: user.userBio ?? '',
		});
		setNickname(user.userNickname ?? '');
		const wh = user.workingHours;
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
		setHydrated(true);
	}, [user, hydrated]);

	const patchProfile = useCallback((partial: Partial<ProfileFormState>) => {
		setProfileForm((prev) => ({ ...prev, ...partial }));
	}, []);

	const patchAvailability = useCallback((partial: Partial<AvailabilityFormState>) => {
		setAvailability((prev) => ({ ...prev, ...partial }));
	}, []);

	const toggleDay = useCallback((day: string) => {
		setAvailability((prev) => ({
			...prev,
			days: { ...prev.days, [day]: !prev.days[day] },
		}));
	}, []);

	const saveUpdate = useCallback(
		async (input: Record<string, unknown>, successMessage: string) => {
			if (!userId) return false;
			try {
				const result = await updateUser({
					variables: { input: { _id: userId, ...input } },
				});
				const token = result.data?.updateUser?.accessToken ?? getJwtToken();
				if (token) updateUserInfo(token);
				await refetch();
				await sweetTopSmallSuccessAlert(successMessage, 1200);
				return true;
			} catch (err) {
				await sweetErrorHandling(err);
				return false;
			}
		},
		[refetch, updateUser, userId],
	);

	const saveProfile = useCallback(
		async (profileImagePath?: string) => {
			const input: Record<string, unknown> = {
				userFullName: profileForm.fullName.trim(),
				userPhoneNumber: profileForm.phone.trim(),
				userLocation: profileForm.location.trim(),
				userBio: profileForm.bio.trim(),
			};
			if (profileImagePath !== undefined) {
				input.userProfileImage = profileImagePath;
			}
			return saveUpdate(input, 'Profile saved.');
		},
		[profileForm, saveUpdate],
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
		error,
		refetch,
		saving,
		profileForm,
		patchProfile,
		nickname,
		setNickname,
		availability,
		patchAvailability,
		toggleDay,
		saveProfile,
		saveAccount,
		saveAvailability,
		savePassword,
	};
}
