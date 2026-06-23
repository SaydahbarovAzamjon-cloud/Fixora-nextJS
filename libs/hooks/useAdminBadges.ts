import { useQuery } from '@apollo/client';
import { GET_STORY_REPORTS, GET_TECHNICIAN_VERIFICATION_QUEUE } from '../../apollo/admin/query';

/** Actionable verification queue count (PENDING + UNDER_REVIEW only). */
export function useAdminBadges() {
	const { data: pendingData } = useQuery(GET_TECHNICIAN_VERIFICATION_QUEUE, {
		variables: {
			input: { page: 1, limit: 1, search: { verificationStatus: 'PENDING' } },
		},
		fetchPolicy: 'cache-and-network',
	});

	const { data: reviewData } = useQuery(GET_TECHNICIAN_VERIFICATION_QUEUE, {
		variables: {
			input: { page: 1, limit: 1, search: { verificationStatus: 'UNDER_REVIEW' } },
		},
		fetchPolicy: 'cache-and-network',
	});

	const { data: reportsData } = useQuery(GET_STORY_REPORTS, {
		variables: { input: { status: 'PENDING' } },
		fetchPolicy: 'cache-and-network',
	});

	const pendingCount = pendingData?.getTechnicianVerificationQueue?.metaCounter?.[0]?.total ?? 0;
	const reviewCount = reviewData?.getTechnicianVerificationQueue?.metaCounter?.[0]?.total ?? 0;

	return {
		verificationCount: pendingCount + reviewCount,
		moderationCount: reportsData?.getStoryReports?.metaCounter?.[0]?.total ?? 0,
	};
}
