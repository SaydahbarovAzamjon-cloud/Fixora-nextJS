import { useQuery } from '@apollo/client';
import { GET_ADMIN_USER_DETAIL } from '../../apollo/admin/query';
import type {
	AdminUser,
	AdminUserBookingStats,
	AdminUserComment,
	LoginHistoryItem,
	UserModerationEntry,
	VerificationAuditEntry,
} from '../types/admin/admin';

const EMPTY_STATS: AdminUserBookingStats = { active: 0, completed: 0, total: 0, totalSpent: 0 };

export function useAdminUserDetail(userId: string | undefined) {
	const skip = !userId;

	const { data, loading, error, refetch } = useQuery(GET_ADMIN_USER_DETAIL, {
		variables: { userId },
		skip,
		fetchPolicy: 'cache-and-network',
	});

	const detail = data?.getAdminUserDetail;
	const user: AdminUser | null = detail?.user ?? null;

	const bookingStats: AdminUserBookingStats = detail?.bookingStats ?? EMPTY_STATS;
	const bookings = detail?.recentBookings ?? [];
	const payments = detail?.recentPayments ?? [];

	const cancelled = Math.max(0, bookingStats.total - bookingStats.completed - bookingStats.active);
	const successRate =
		bookingStats.total > 0 ? Math.round((bookingStats.completed / bookingStats.total) * 100) : 0;

	const refetchAll = async () => {
		await refetch();
	};

	return {
		user,
		loading,
		error,
		bookings,
		bookingStats: {
			total: bookingStats.total,
			completed: bookingStats.completed,
			cancelled,
		},
		successRate,
		payments,
		articles: detail?.articles ?? [],
		stories: detail?.stories ?? [],
		techReviews: detail?.technicianReviews ?? [],
		userReviews: detail?.userReviews ?? [],
		clientProfile: detail?.clientProfile ?? null,
		analytics: detail?.analytics ?? null,
		commentsByUser: (detail?.commentsByUser ?? []) as AdminUserComment[],
		reportsReceived: detail?.reportsReceived ?? [],
		loginHistory: (detail?.loginHistory ?? []) as LoginHistoryItem[],
		moderationHistory: (detail?.moderationHistory ?? []) as UserModerationEntry[],
		verificationTimeline: (detail?.verificationTimeline ??
			user?.verificationTimeline ??
			[]) as VerificationAuditEntry[],
		sectionsLoading: {
			bookings: loading,
			payments: loading,
			articles: loading,
			stories: loading,
			reviews: loading,
		},
		refetchAll,
	};
}
