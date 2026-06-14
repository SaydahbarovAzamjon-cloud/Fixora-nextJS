import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PendingIcon from '@mui/icons-material/Pending';

interface TimelineStep {
	label: string;
	status: 'completed' | 'in-progress' | 'pending';
	timestamp?: string;
}

interface RepairTimelineProps {
	steps: TimelineStep[];
}

const RepairTimeline: React.FC<RepairTimelineProps> = ({ steps }) => {
	return (
		<div className="fixora-repair-timeline">
			{steps.map((step, index) => (
				<div
					key={index}
					className={`fixora-timeline-step fixora-timeline-step--${step.status}`}
				>
					{/* Step Icon */}
					<div className="fixora-timeline-step__icon-wrapper">
						{step.status === 'completed' && (
							<CheckCircleIcon className="fixora-timeline-step__icon fixora-timeline-step__icon--completed" />
						)}
						{step.status === 'in-progress' && (
							<AccessTimeIcon className="fixora-timeline-step__icon fixora-timeline-step__icon--in-progress" />
						)}
						{step.status === 'pending' && (
							<PendingIcon className="fixora-timeline-step__icon fixora-timeline-step__icon--pending" />
						)}

						{/* Connector Line */}
						{index < steps.length - 1 && (
							<div className="fixora-timeline-step__connector" />
						)}
					</div>

					{/* Step Content */}
					<div className="fixora-timeline-step__content">
						<h4 className="fixora-timeline-step__label">{step.label}</h4>
						{step.timestamp && (
							<p className="fixora-timeline-step__timestamp">
								{step.timestamp}
							</p>
						)}
					</div>
				</div>
			))}
		</div>
	);
};

export default RepairTimeline;
