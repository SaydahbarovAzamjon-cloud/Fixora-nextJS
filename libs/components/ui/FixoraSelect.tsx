import React, { ReactNode, SelectHTMLAttributes } from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

export interface FixoraSelectOption {
	value: string;
	label: string;
}

export interface FixoraSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
	label?: string;
	icon?: ReactNode;
	error?: boolean;
	helperText?: string;
	options: FixoraSelectOption[];
	placeholder?: string;
}

const FixoraSelect = ({
	label,
	icon,
	error = false,
	helperText,
	options,
	placeholder,
	id,
	className = '',
	...rest
}: FixoraSelectProps) => {
	const selectId = id || rest.name;

	return (
		<div className={`fixora-input ${className}`.trim()}>
			{label && (
				<label className="fixora-input__label" htmlFor={selectId}>
					{label}
				</label>
			)}
			<div className={`fixora-input__field${error ? ' fixora-input__field--error' : ''}`}>
				{icon && <span className="fixora-input__icon">{icon}</span>}
				<select id={selectId} className="fixora-input__control fixora-input__select" {...rest}>
					{placeholder && (
						<option value="" disabled>
							{placeholder}
						</option>
					)}
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				<span className="fixora-input__icon fixora-input__icon--end">
					<KeyboardArrowDownRoundedIcon fontSize="small" />
				</span>
			</div>
			{helperText && (
				<span className={`fixora-input__helper${error ? ' fixora-input__helper--error' : ''}`}>{helperText}</span>
			)}
		</div>
	);
};

export default FixoraSelect;
