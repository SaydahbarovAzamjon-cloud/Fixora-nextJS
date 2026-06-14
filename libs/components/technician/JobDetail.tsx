import React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RepairTimeline from './RepairTimeline';

interface JobDetailProps {
	jobId?: string;
	deviceType?: string;
	deviceModel?: string;
	repairTitle?: string;
	status?: 'pending' | 'in-progress' | 'completed' | 'waiting-parts';
	customerName?: string;
	price?: number;
	startDate?: string;
	onUpdateStatus?: (status: string) => void;
	onMarkComplete?: () => void;
}

const JobDetail: React.FC<JobDetailProps> = ({
	jobId,
	deviceType = 'iPhone',
	deviceModel = '13',
	repairTitle = 'Screen Repair',
	status = 'in-progress',
	customerName = 'John D.',
	price = 35,
	startDate = 'May 18, 10:30 AM',
	onUpdateStatus,
	onMarkComplete,
}) => {
	if (!jobId) {
		return (
			<div className="fixora-job-detail fixora-job-detail--empty">
				<div className="fixora-job-detail__empty-state">
					<p>Select a job to view details</p>
				</div>
			</div>
		);
	}

	const timelineSteps = [
		{ label: 'Request Accepted', status: 'completed' as const, timestamp: 'May 18, 10:30 AM' },
		{ label: 'Device Received', status: 'in-progress' as const, timestamp: 'May 18, 11:00 AM' },
		{ label: 'Repair in Progress', status: 'pending' as const },
		{ label: 'Quality Check', status: 'pending' as const },
		{ label: 'Job Completed', status: 'pending' as const },
	];

	return (
		<div className="fixora-job-detail">
			{/* Header */}
			<div className="fixora-job-detail__header">
				<div>
					<h3 className="fixora-job-detail__title">{repairTitle}</h3>
					<p className="fixora-job-detail__subtitle">
						{deviceType} {deviceModel} • {customerName}
					</p>
				</div>
				<div className="fixora-job-detail__status-badge">
					{status === 'in-progress' && '⏱️ In Progress'}
					{status === 'waiting-parts' && '⏳ Waiting Parts'}
					{status === 'completed' && '✅ Completed'}
					{status === 'pending' && '⏳ Pending'}
				</div>
			</div>

			{/* Job Info Grid */}
			<div className="fixora-job-detail__info-grid">
				<div className="fixora-job-info-card">
					<span className="fixora-job-info-card__label">Device</span>
					<span className="fixora-job-info-card__value">
						{deviceType} {deviceModel}
					</span>
				</div>
				<div className="fixora-job-info-card">
					<span className="fixora-job-info-card__label">Status</span>
					<span className="fixora-job-info-card__value">
						{status === 'in-progress' && 'In Progress'}
						{status === 'waiting-parts' && 'Waiting Parts'}
						{status === 'completed' && 'Completed'}
						{status === 'pending' && 'Pending'}
					</span>
				</div>
				<div className="fixora-job-info-card">
					<span className="fixora-job-info-card__label">Customer</span>
					<span className="fixora-job-info-card__value">{customerName}</span>
				</div>
				<div className="fixora-job-info-card">
					<span className="fixora-job-info-card__label">Start Date</span>
					<span className="fixora-job-info-card__value">{startDate}</span>
				</div>
			</div>

			{/* Repair Timeline */}
			<div className="fixora-job-detail__section">
				<h4 className="fixora-job-detail__section-title">Repair Timeline</h4>
				<RepairTimeline steps={timelineSteps} />
			</div>

			{/* Notes Section */}
			<div className="fixora-job-detail__section">
				<div className="fixora-job-detail__section-header">
					<h4 className="fixora-job-detail__section-title">Work Notes</h4>
					<button className="fixora-job-detail__edit-btn">
						<EditIcon sx={{ fontSize: 16 }} />
						Edit
					</button>
				</div>
				<textarea
					className="fixora-job-detail__notes"
					placeholder="Add work notes, progress updates, or any observations..."
					defaultValue="Device received in good condition. Screen damaged with cracks on top left. Starting repair process."
					readOnly
				/>
			</div>

			{/* Footer Actions */}
			<div className="fixora-job-detail__footer">
				<div className="fixora-job-detail__price-section">
					<span className="fixora-job-detail__price-label">Total Price</span>
					<span className="fixora-job-detail__price-value">${price}</span>
				</div>

				<div className="fixora-job-detail__actions">
					<select className="fixora-job-detail__status-select">
						<option>Request Accepted</option>
						<option>Device Received</option>
						<option>Repair in Progress</option>
						<option>Quality Check</option>
						<option>Waiting for Parts</option>
					</select>

					<button
						className="fixora-job-detail__btn fixora-job-detail__btn--complete"
						onClick={onMarkComplete}
					>
						<CheckCircleIcon />
						Mark as Completed
					</button>
				</div>
			</div>
		</div>
	);
};

export default JobDetail;
