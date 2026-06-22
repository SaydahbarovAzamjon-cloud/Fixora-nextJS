import { gql } from '@apollo/client';

export const GET_MY_SCHEDULE = gql`
	query GetMySchedule($input: ScheduleInquiry!) {
		getMySchedule(input: $input) {
			list {
				_id
				title
				notes
				startsAt
				endsAt
				technicianId
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const CREATE_SCHEDULE_ITEM = gql`
	mutation CreateScheduleItem($input: ScheduleItemInput!) {
		createScheduleItem(input: $input) {
			_id
			title
			notes
			startsAt
			endsAt
			technicianId
			createdAt
			updatedAt
		}
	}
`;

export const DELETE_SCHEDULE_ITEM = gql`
	mutation DeleteScheduleItem($scheduleItemId: String!) {
		deleteScheduleItem(scheduleItemId: $scheduleItemId) {
			_id
		}
	}
`;
