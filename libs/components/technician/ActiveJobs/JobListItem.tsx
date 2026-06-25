import React from 'react';
import { Box, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { JOB_STAGE_INFO, JobStage, deviceIcon, deviceLabel, getJobProgress } from './jobHelpers';
import { formatKrw } from '../../../utils/formatCurrency';

interface JobListItemProps {
	job: any;
	active: boolean;
	onClick: () => void;
}

const Card = styled(Box)<{ active?: boolean }>(({ active }) => ({
	padding: 14,
	borderRadius: 11,
	marginBottom: 8,
	cursor: 'pointer',
	border: active ? '1px solid rgba(255,107,0,0.3)' : '1px solid rgba(255,255,255,0.05)',
	backgroundColor: active ? 'rgba(255,107,0,0.08)' : 'transparent',
	transition: 'all 0.15s ease',
	'&:hover': {
		backgroundColor: active ? 'rgba(255,107,0,0.08)' : 'rgba(255,255,255,0.03)',
	},
}));

const IconBox = styled(Box)({
	width: 36,
	height: 36,
	borderRadius: 10,
	background: '#1C1C1C',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	fontSize: 16,
	flexShrink: 0,
});

const StageChip = styled(Chip)<{ stagecolor: string; stagebg: string }>(({ stagecolor, stagebg }) => ({
	height: 22,
	fontSize: 11,
	fontWeight: 700,
	color: stagecolor,
	backgroundColor: stagebg,
	'& .MuiChip-label': { padding: '0 8px' },
}));

const ProgressTrack = styled(LinearProgress)<{ barcolor: string }>(({ barcolor }) => ({
	height: 6,
	borderRadius: 4,
	backgroundColor: 'rgba(255,255,255,0.06)',
	'& .MuiLinearProgress-bar': {
		borderRadius: 4,
		background: `linear-gradient(90deg, ${barcolor}, #FF9A3C)`,
	},
}));

const JobListItem: React.FC<JobListItemProps> = ({ job, active, onClick }) => {
	const stage: JobStage = job.__stage;
	const stageInfo = JOB_STAGE_INFO[stage];
	const progress = getJobProgress(job);
	const price = parseFloat(job.finalPrice ?? job.estimatedPrice ?? '0');

	return (
		<Card active={active} onClick={onClick}>
			<Stack direction="row" spacing={1.25} alignItems="flex-start" mb={1}>
				<IconBox>{deviceIcon(job.aiClassification?.deviceType)}</IconBox>
				<div style={{ flex: 1, minWidth: 0 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.25}>
						<Typography sx={{ color: '#E0E0E0', fontSize: 13, fontWeight: 600 }}>Customer</Typography>
						<StageChip label={stageInfo.label} stagecolor={stageInfo.color} stagebg={stageInfo.bg} />
					</Stack>
					<Typography sx={{ color: '#808080', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
						{deviceLabel(job.aiClassification?.deviceType)}
					</Typography>
				</div>
			</Stack>

			<Typography sx={{ color: '#707070', fontSize: 12, lineHeight: 1.4, mb: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
				{job.problemTitle}
			</Typography>

			<ProgressTrack variant="determinate" value={progress} barcolor={stageInfo.color} />
			<Stack direction="row" justifyContent="space-between" alignItems="center" mt={0.75}>
				<Typography sx={{ color: '#FF6B00', fontSize: 13, fontWeight: 700 }}>{formatKrw(price)}</Typography>
				<Typography sx={{ color: '#606060', fontSize: 11 }}>{progress}%</Typography>
			</Stack>
		</Card>
	);
};

export default JobListItem;
