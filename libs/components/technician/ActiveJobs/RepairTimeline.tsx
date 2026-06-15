import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { buildTimeline, formatDateTime } from './jobHelpers';

interface RepairTimelineProps {
	booking: any;
}

const Card = styled(Box)({
	background: '#111111',
	border: '1px solid rgba(255,255,255,0.07)',
	borderRadius: 14,
	padding: 20,
});

const Dot = styled(Box)<{ done?: boolean }>(({ done }) => ({
	width: 28,
	height: 28,
	borderRadius: '50%',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	fontSize: 14,
	flexShrink: 0,
	color: done ? '#FF6B00' : '#505050',
	border: `2px solid ${done ? '#FF6B00' : 'rgba(255,255,255,0.1)'}`,
	background: done ? 'rgba(255,107,0,0.08)' : 'transparent',
}));

const Connector = styled(Box)<{ done?: boolean }>(({ done }) => ({
	width: 2,
	flex: 1,
	minHeight: 24,
	background: done ? '#FF6B00' : 'rgba(255,255,255,0.08)',
}));

const StepContent = styled(Box)<{ last?: boolean }>(({ last }) => ({
	paddingBottom: last ? 0 : 24,
}));

const RepairTimeline: React.FC<RepairTimelineProps> = ({ booking }) => {
	const steps = buildTimeline(booking);

	return (
		<Card>
			<Typography sx={{ color: '#606060', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 2 }}>
				Repair Timeline
			</Typography>

			<Stack>
				{steps.map((step, idx) => {
					const isLast = idx === steps.length - 1;
					return (
						<Stack direction="row" key={step.label} spacing={1.5}>
							<Stack alignItems="center">
								<Dot done={step.done}>{step.done ? '✓' : '○'}</Dot>
								{!isLast && <Connector done={step.done} />}
							</Stack>
							<StepContent last={isLast}>
								<Typography sx={{ color: step.done ? '#F0F0F0' : '#606060', fontSize: 14, fontWeight: 700 }}>
									{step.label}
								</Typography>
								{step.timestamp && (
									<Typography sx={{ color: '#606060', fontSize: 12, mt: 0.25 }}>
										{formatDateTime(step.timestamp)}
									</Typography>
								)}
							</StepContent>
						</Stack>
					);
				})}
			</Stack>
		</Card>
	);
};

export default RepairTimeline;
