import React from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import RepairTimeline from './RepairTimeline';
import { JOB_STAGE_INFO, JobStage, deviceLabel, formatDateTime, formatDue } from './jobHelpers';

interface JobDetailPanelProps {
	job: any;
	onMarkComplete: (bookingId: string) => void;
	completing: boolean;
}

const InfoCard = styled(Box)({
	background: '#111111',
	border: '1px solid rgba(255,255,255,0.07)',
	borderRadius: 14,
	padding: 18,
	flex: 1,
});

const Label = styled(Typography)({
	color: '#606060',
	fontSize: 11,
	fontWeight: 600,
	letterSpacing: '0.08em',
	textTransform: 'uppercase',
	marginBottom: 8,
});

const DescriptionCard = styled(Box)({
	background: '#111111',
	border: '1px solid rgba(255,255,255,0.07)',
	borderRadius: 14,
	padding: 20,
});

const StageChip = styled(Chip)<{ stagecolor: string; stagebg: string }>(({ stagecolor, stagebg }) => ({
	height: 28,
	fontSize: 12,
	fontWeight: 700,
	color: stagecolor,
	backgroundColor: stagebg,
	'& .MuiChip-label': { padding: '0 12px' },
}));

const CompleteButton = styled(Button)({
	background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
	color: '#fff',
	fontWeight: 700,
	fontSize: 14,
	padding: '14px 24px',
	borderRadius: 12,
	boxShadow: '0 0 24px rgba(255,107,0,0.4)',
	'&:hover': {
		background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
		boxShadow: '0 0 36px rgba(255,107,0,0.6)',
	},
	'&.Mui-disabled': {
		color: 'rgba(255,255,255,0.5)',
	},
});

const JobDetailPanel: React.FC<JobDetailPanelProps> = ({ job, onMarkComplete, completing }) => {
	const stage: JobStage = job.__stage;
	const stageInfo = JOB_STAGE_INFO[stage];
	const price = parseFloat(job.finalPrice ?? job.estimatedPrice ?? '0');
	const isCompleted = job.bookingStatus === 'COMPLETED';

	return (
		<Box sx={{ maxWidth: 720 }}>
			<Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
				<Box>
					<Typography sx={{ color: '#606060', fontSize: 12, mb: 0.5 }}>
						JOB-{job._id.slice(-4).toUpperCase()} • Started {formatDateTime(job.createdAt)}
					</Typography>
					<Typography sx={{ color: '#F0F0F0', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
						{job.problemTitle}
					</Typography>
					<Typography sx={{ color: '#808080', fontSize: 13, mt: 0.5 }}>
						{deviceLabel(job.aiClassification?.deviceType)}
					</Typography>
				</Box>
				<StageChip label={stageInfo.label} stagecolor={stageInfo.color} stagebg={stageInfo.bg} />
			</Stack>

			<Stack direction="row" spacing={1.75} mb={2.25}>
				<InfoCard>
					<Label>Client</Label>
					<Typography sx={{ color: '#E0E0E0', fontSize: 15, fontWeight: 700 }}>Customer</Typography>
					<Typography sx={{ color: '#606060', fontSize: 12, mt: 0.25 }}>Verified Customer</Typography>
				</InfoCard>
				<InfoCard>
					<Label>Price</Label>
					<Typography sx={{ color: '#FF6B00', fontSize: 18, fontWeight: 700 }}>${price.toFixed(2)}</Typography>
					<Typography sx={{ color: '#606060', fontSize: 12, mt: 0.25 }}>
						{job.isPaid ? 'Paid' : 'Pending payment'}
					</Typography>
				</InfoCard>
				<InfoCard>
					<Label>Due Date</Label>
					<Typography sx={{ color: '#E0E0E0', fontSize: 15, fontWeight: 700 }}>{formatDue(job.bookingDate)}</Typography>
					<Typography sx={{ color: '#606060', fontSize: 12, mt: 0.25 }}>Estimated completion</Typography>
				</InfoCard>
			</Stack>

			<Box mb={2.25}>
				<RepairTimeline booking={job} />
			</Box>

			<DescriptionCard mb={2.5}>
				<Label>Issue</Label>
				<Typography sx={{ color: '#C0C0C0', fontSize: 14, lineHeight: 1.7 }}>
					{job.problemDescription || 'No description provided'}
				</Typography>
			</DescriptionCard>

			<CompleteButton
				fullWidth
				disabled={isCompleted || completing}
				onClick={() => onMarkComplete(job._id)}
			>
				{isCompleted ? '✓ Repair Completed' : '→ Mark Repair Complete'}
			</CompleteButton>
		</Box>
	);
};

export default JobDetailPanel;
