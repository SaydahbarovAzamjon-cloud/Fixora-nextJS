import React, { useState } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import ActiveJobsList from '../../../libs/components/technician/ActiveJobsList';
import JobDetail from '../../../libs/components/technician/JobDetail';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

interface JobCard {
	id: string;
	deviceType: string;
	deviceModel: string;
	repairType: string;
	status: 'pending' | 'in-progress' | 'completed' | 'waiting-parts';
	customerName: string;
	price: number;
	startDate: string;
}

const ActiveJobs: NextPage = () => {
	const [selectedJobId, setSelectedJobId] = useState<string | undefined>();

	// Mock data - replace with GraphQL query
	const mockJobs: JobCard[] = [
		{
			id: '1',
			deviceType: 'iPhone',
			deviceModel: '13 Screen Repair',
			repairType: 'Screen Repair',
			status: 'in-progress',
			customerName: 'John D.',
			price: 35,
			startDate: 'Today, 10:30 AM',
		},
		{
			id: '2',
			deviceType: 'MacBook',
			deviceModel: 'Air Overheating',
			repairType: 'Thermal Paste Replacement',
			status: 'in-progress',
			customerName: 'Sarah L.',
			price: 60,
			startDate: 'Today, 02:00 PM',
		},
		{
			id: '3',
			deviceType: 'iPad',
			deviceModel: 'Air Battery Issue',
			repairType: 'Battery Replacement',
			status: 'waiting-parts',
			customerName: 'Michael K.',
			price: 25,
			startDate: 'Yesterday, 04:30 PM',
		},
		{
			id: '4',
			deviceType: 'iPhone',
			deviceModel: 'Water Damage',
			repairType: 'Water Damage Repair',
			status: 'completed',
			customerName: 'David E.',
			price: 30,
			startDate: 'Yesterday, 08:15 PM',
		},
		{
			id: '5',
			deviceType: 'Apple Watch',
			deviceModel: 'Series 8 Screen',
			repairType: 'Screen Replacement',
			status: 'pending',
			customerName: 'Emma W.',
			price: 45,
			startDate: 'May 15, 03:00 PM',
		},
	];

	const selectedJob = mockJobs.find((j) => j.id === selectedJobId);

	return (
		<div className="fixora-technician-active-jobs">
			<div className="fixora-active-jobs-container">
				{/* Left Pane - List */}
				<div className="fixora-active-jobs-left">
					<ActiveJobsList
						jobs={mockJobs}
						selectedId={selectedJobId}
						onSelectJob={setSelectedJobId}
					/>
				</div>

				{/* Right Pane - Detail */}
				<div className="fixora-active-jobs-right">
					<JobDetail
						jobId={selectedJobId}
						deviceType={selectedJob?.deviceType}
						deviceModel={selectedJob?.deviceModel.split(' ')[0]}
						repairTitle={selectedJob?.repairType}
						status={selectedJob?.status}
						customerName={selectedJob?.customerName}
						price={selectedJob?.price}
						startDate={selectedJob?.startDate}
						onMarkComplete={() => {
							console.log('Marking job as completed:', selectedJobId);
							setSelectedJobId(undefined);
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default withTechnicianLayout(ActiveJobs);
