import React from 'react';
import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { JOB_STAGE_INFO, JobStage } from './jobHelpers';

export type JobFilterId = 'all' | JobStage;

interface JobFilterOption {
	id: JobFilterId;
	label: string;
	count: number;
}

interface JobFiltersProps {
	jobs: any[];
	active: JobFilterId;
	onChange: (id: JobFilterId) => void;
}

const FilterChip = styled(Chip)<{ active?: boolean; dotcolor?: string }>(({ active, dotcolor }) => ({
	height: 30,
	fontSize: 12,
	fontWeight: 600,
	color: active ? '#fff' : '#A0A0A0',
	backgroundColor: active ? 'var(--fixora-primary)' : 'rgba(255,255,255,0.04)',
	border: active ? 'none' : '1px solid rgba(255,255,255,0.08)',
	'& .MuiChip-label': { padding: '0 10px' },
	...(dotcolor && !active
		? {
				'&::before': {
					content: '""',
					display: 'inline-block',
					width: 6,
					height: 6,
					borderRadius: '50%',
					backgroundColor: dotcolor,
					marginLeft: 10,
				},
			}
		: {}),
}));

const JobFilters: React.FC<JobFiltersProps> = ({ jobs, active, onChange }) => {
	const counters: Record<JobStage, number> = { DIAGNOSING: 0, IN_PROGRESS: 0, PARTS_ORDERED: 0, READY_FOR_PICKUP: 0 };
	jobs.forEach((job: any) => {
		const stage: JobStage = job.__stage;
		if (counters[stage] !== undefined) counters[stage] += 1;
	});

	const options: JobFilterOption[] = [
		{ id: 'all', label: 'All Jobs', count: jobs.length },
		{ id: 'DIAGNOSING', label: JOB_STAGE_INFO.DIAGNOSING.label, count: counters.DIAGNOSING },
		{ id: 'IN_PROGRESS', label: JOB_STAGE_INFO.IN_PROGRESS.label, count: counters.IN_PROGRESS },
		{ id: 'PARTS_ORDERED', label: JOB_STAGE_INFO.PARTS_ORDERED.label, count: counters.PARTS_ORDERED },
		{ id: 'READY_FOR_PICKUP', label: JOB_STAGE_INFO.READY_FOR_PICKUP.label, count: counters.READY_FOR_PICKUP },
	];

	return (
		<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
			{options.map((opt) => (
				<FilterChip
					key={opt.id}
					label={`${opt.label}${opt.count ? `  ${opt.count}` : ''}`}
					active={active === opt.id}
					onClick={() => onChange(opt.id)}
					clickable
				/>
			))}
		</div>
	);
};

export default JobFilters;
