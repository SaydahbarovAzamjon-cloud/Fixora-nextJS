import { gql } from '@apollo/client';

export const GET_TECHNICIAN_ANALYTICS = gql`
	query GetTechnicianAnalytics($technicianId: String!) {
		getTechnicianAnalytics(technicianId: $technicianId) {
			averageRating
			averageRatingTrendPercent
			avgResponseMinutes
			avgResponseTrendPercent
			completedJobsCount
			completedJobsTrendPercent
			reviewCount
			reviewCountTrendPercent
			topPerformerPercentile
		}
	}
`;

export const GET_TECHNICIAN_RANK = gql`
	query GetTechnicianRank($technicianId: String!) {
		getTechnicianRank(technicianId: $technicianId) {
			badgeLabel
			percentile
		}
	}
`;
