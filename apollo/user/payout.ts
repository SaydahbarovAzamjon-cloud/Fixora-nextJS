import { gql } from '@apollo/client';

export const GET_WALLET_BALANCE = gql`
	query GetWalletBalance {
		getWalletBalance {
			availableBalance
			pendingBalance
			totalEarned
			nextPayoutAt
			estimatedAmount
			currency
		}
	}
`;

export const GET_MY_PAYOUTS = gql`
	query GetMyPayouts($input: PayoutsInquiry!) {
		getMyPayouts(input: $input) {
			list {
				_id
				payoutAmount
				payoutStatus
				payoutMethod
				accountLabel
				requestedAt
				completedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const REQUEST_PAYOUT = gql`
	mutation RequestPayout($input: RequestPayoutInput!) {
		requestPayout(input: $input) {
			_id
			payoutAmount
			payoutStatus
			payoutMethod
			completedAt
		}
	}
`;

export const EXPORT_EARNINGS_REPORT = gql`
	query ExportEarningsReport($input: ExportEarningsReportInput!) {
		exportEarningsReport(input: $input) {
			contentBase64
			fileName
			mimeType
			rowCount
		}
	}
`;
