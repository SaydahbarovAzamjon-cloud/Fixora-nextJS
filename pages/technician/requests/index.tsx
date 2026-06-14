import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import IncomingRequestsList from '../../../libs/components/technician/IncomingRequestsList';
import RequestDetail from '../../../libs/components/technician/RequestDetail';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

interface RequestCard {
	id: string;
	deviceType: string;
	deviceModel: string;
	customerName: string;
	location: string;
	price: number;
	isNew: boolean;
	timestamp: string;
}

const IncomingRequests: NextPage = () => {
	const router = useRouter();
	const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>();

	// Mock data - replace with GraphQL query
	const mockRequests: RequestCard[] = [
		{
			id: '1',
			deviceType: 'iPhone',
			deviceModel: '13 Screen Repair',
			customerName: 'John D.',
			location: 'Seoul, KR',
			price: 35,
			isNew: true,
			timestamp: 'Today 10:30 AM',
		},
		{
			id: '2',
			deviceType: 'MacBook',
			deviceModel: 'Air Overheating',
			customerName: 'Sarah L.',
			location: 'Busan, KR',
			price: 60,
			isNew: true,
			timestamp: 'Today 02:00 PM',
		},
		{
			id: '3',
			deviceType: 'iPad',
			deviceModel: 'Air Battery Issue',
			customerName: 'Michael K.',
			location: 'Incheon, KR',
			price: 25,
			isNew: false,
			timestamp: 'Yesterday 04:30 PM',
		},
		{
			id: '4',
			deviceType: 'iPhone',
			deviceModel: 'Water Damage',
			customerName: 'David E.',
			location: 'Seoul, KR',
			price: 30,
			isNew: false,
			timestamp: 'Yesterday 08:15 PM',
		},
	];

	const selectedRequest = mockRequests.find((r) => r.id === selectedRequestId);

	return (
		<div className="fixora-technician-incoming-requests">
			<div className="fixora-incoming-requests-container">
				{/* Left Pane - List */}
				<div className="fixora-incoming-requests-left">
					<IncomingRequestsList
						requests={mockRequests}
						selectedId={selectedRequestId}
						onSelectRequest={setSelectedRequestId}
					/>
				</div>

				{/* Right Pane - Detail */}
				<div className="fixora-incoming-requests-right">
					<RequestDetail
						requestId={selectedRequestId}
						deviceModel={selectedRequest?.deviceModel.split(' ')[0]}
						deviceType={selectedRequest?.deviceType}
						color="Space Gray"
						storage="256GB"
						problemDescription="My device has issues that need repair. Please review the photos for details."
						preferredTime={selectedRequest?.timestamp}
						price={selectedRequest?.price}
						customerName={selectedRequest?.customerName}
						onRespond={() => {
							console.log('Responding to request:', selectedRequestId);
						}}
						onDecline={() => {
							console.log('Declining request:', selectedRequestId);
							setSelectedRequestId(undefined);
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default withTechnicianLayout(IncomingRequests);
