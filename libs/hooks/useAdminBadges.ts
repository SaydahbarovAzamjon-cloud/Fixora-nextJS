import { useQuery } from '@apollo/client';
import { GET_STORY_REPORTS, GET_TECHNICIAN_VERIFICATION_QUEUE } from '../../apollo/admin/query';

export function useAdminBadges() {
	const { data: verificationData } = useQuery(GET_TECHNICIAN_VERIFICATION_QUEUE, {
		variables: { input: { page: 1, limit: 1, search: {} } },
		fetchPolicy: 'cache-and-network',
	});

	const { data: reportsData } = useQuery(GET_STORY_REPORTS, {
		variables: { input: { status: 'PENDING' } },
		fetchPolicy: 'cache-and-network',
	});

	return {
		verificationCount: verificationData?.getTechnicianVerificationQueue?.metaCounter?.[0]?.total ?? 0,
		moderationCount: reportsData?.getStoryReports?.metaCounter?.[0]?.total ?? 0,
	};
}
