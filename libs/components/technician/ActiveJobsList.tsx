import React, { useState } from 'react';

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

interface ActiveJobsListProps {
	jobs: JobCard[];
	selectedId?: string;
	onSelectJob: (id: string) => void;
}

const ActiveJobsList: React.FC<ActiveJobsListProps> = ({
	jobs,
	selectedId,
	onSelectJob,
}) => {
	const [activeTab, setActiveTab] = useState('all');

	const getStatusBadgeColor = (status: string) => {
		switch (status) {
			case 'pending':
				return 'fixora-job-badge--pending';
			case 'in-progress':
				return 'fixora-job-badge--in-progress';
			case 'waiting-parts':
				return 'fixora-job-badge--waiting';
			case 'completed':
				return 'fixora-job-badge--completed';
			default:
				return '';
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'pending':
				return 'Pending';
			case 'in-progress':
				return 'In Progress';
			case 'waiting-parts':
				return 'Waiting Parts';
			case 'completed':
				return 'Completed';
			default:
				return '';
		}
	};

	const filteredJobs =
		activeTab === 'all'
			? jobs
			: jobs.filter((job) => {
					if (activeTab === 'in-progress') return job.status === 'in-progress';
					if (activeTab === 'waiting') return job.status === 'waiting-parts';
					if (activeTab === 'completed') return job.status === 'completed';
					if (activeTab === 'cancelled') return job.status === 'pending';
					return true;
				});

	return (
		<div className="fixora-active-jobs-list">
			{/* Header */}
			<div className="fixora-jobs-list__header">
				<h2 className="fixora-jobs-list__title">Active Jobs</h2>
			</div>

			{/* Status Tabs */}
			<div className="fixora-jobs-list__tabs">
				<button
					className={`fixora-jobs-list__tab ${activeTab === 'all' ? 'fixora-jobs-list__tab--active' : ''}`}
					onClick={() => setActiveTab('all')}
				>
					All <span className="fixora-jobs-list__tab-count">{jobs.length}</span>
				</button>
				<button
					className={`fixora-jobs-list__tab ${activeTab === 'in-progress' ? 'fixora-jobs-list__tab--active' : ''}`}
					onClick={() => setActiveTab('in-progress')}
				>
					In Progress{' '}
					<span className="fixora-jobs-list__tab-count">
						{jobs.filter((j) => j.status === 'in-progress').length}
					</span>
				</button>
				<button
					className={`fixora-jobs-list__tab ${activeTab === 'waiting' ? 'fixora-jobs-list__tab--active' : ''}`}
					onClick={() => setActiveTab('waiting')}
				>
					Waiting Parts{' '}
					<span className="fixora-jobs-list__tab-count">
						{jobs.filter((j) => j.status === 'waiting-parts').length}
					</span>
				</button>
				<button
					className={`fixora-jobs-list__tab ${activeTab === 'completed' ? 'fixora-jobs-list__tab--active' : ''}`}
					onClick={() => setActiveTab('completed')}
				>
					Completed{' '}
					<span className="fixora-jobs-list__tab-count">
						{jobs.filter((j) => j.status === 'completed').length}
					</span>
				</button>
				<button
					className={`fixora-jobs-list__tab ${activeTab === 'cancelled' ? 'fixora-jobs-list__tab--active' : ''}`}
					onClick={() => setActiveTab('cancelled')}
				>
					Cancelled{' '}
					<span className="fixora-jobs-list__tab-count">0</span>
				</button>
			</div>

			{/* Jobs List */}
			<div className="fixora-jobs-list__items">
				{filteredJobs.length > 0 ? (
					filteredJobs.map((job) => (
						<div
							key={job.id}
							className={`fixora-job-card ${
								selectedId === job.id ? 'fixora-job-card--active' : ''
							}`}
							onClick={() => onSelectJob(job.id)}
						>
							<div className="fixora-job-card__icon">
								{job.deviceType === 'iPhone' && '📱'}
								{job.deviceType === 'MacBook' && '💻'}
								{job.deviceType === 'iPad' && '📱'}
								{job.deviceType === 'Apple Watch' && '⌚'}
							</div>

							<div className="fixora-job-card__content">
								<div className="fixora-job-card__title">
									{job.repairType}
								</div>
								<div className="fixora-job-card__subtitle">
									{job.deviceType} {job.deviceModel}
								</div>
								<div className="fixora-job-card__customer">
									{job.customerName}
								</div>
								<div className="fixora-job-card__date">
									{job.startDate}
								</div>
							</div>

							<div className="fixora-job-card__status">
								<span
									className={`fixora-job-badge ${getStatusBadgeColor(
										job.status
									)}`}
								>
									{getStatusLabel(job.status)}
								</span>
								<span className="fixora-job-card__price">
									${job.price}
								</span>
							</div>
						</div>
					))
				) : (
					<div className="fixora-jobs-list__empty">
						<p>No jobs found</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default ActiveJobsList;
