import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

export interface FixoraSelectOption {
	value: string;
	label: string;
}

export interface FixoraSelectProps {
	label?: string;
	icon?: ReactNode;
	error?: boolean;
	helperText?: string;
	options: FixoraSelectOption[];
	placeholder?: string;
	id?: string;
	className?: string;
	value?: string;
	disabled?: boolean;
	name?: string;
	onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	'aria-label'?: string;
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
	value = '',
	disabled,
	name,
	onChange,
	'aria-label': ariaLabel,
}: FixoraSelectProps) => {
	const selectId = id || name;
	const rootRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);

	const selectedLabel = useMemo(() => {
		const match = options.find((option) => option.value === value);
		return match?.label ?? '';
	}, [options, value]);

	useEffect(() => {
		if (!open) return;
		const handler = (event: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [open]);

	const fireChange = (nextValue: string) => {
		if (onChange) {
			onChange({ target: { value: nextValue, name } } as React.ChangeEvent<HTMLSelectElement>);
		}
		setOpen(false);
	};

	return (
		<div className={`fixora-input fixora-select ${className}`.trim()} ref={rootRef}>
			{label && (
				<label className="fixora-input__label" htmlFor={selectId}>
					{label}
				</label>
			)}
			<div className={`fixora-select__wrap${open ? ' fixora-select__wrap--open' : ''}`}>
				<button
					type="button"
					id={selectId}
					className={`fixora-input__field fixora-select__trigger${error ? ' fixora-input__field--error' : ''}`}
					disabled={disabled}
					aria-haspopup="listbox"
					aria-expanded={open}
					aria-label={ariaLabel}
					onClick={() => !disabled && setOpen((prev) => !prev)}
				>
					{icon && <span className="fixora-input__icon">{icon}</span>}
					<span className={`fixora-select__value${!selectedLabel ? ' fixora-select__value--placeholder' : ''}`}>
						{selectedLabel || placeholder}
					</span>
					<span className="fixora-input__icon fixora-input__icon--end">
						<KeyboardArrowDownRoundedIcon fontSize="small" />
					</span>
				</button>
				{open && (
					<ul className="fixora-select__menu" role="listbox">
						{options.map((option) => (
							<li key={option.value}>
								<button
									type="button"
									role="option"
									aria-selected={value === option.value}
									className={`fixora-select__option${value === option.value ? ' fixora-select__option--active' : ''}`}
									onClick={() => fireChange(option.value)}
								>
									{option.label}
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
			{helperText && (
				<span className={`fixora-input__helper${error ? ' fixora-input__helper--error' : ''}`}>{helperText}</span>
			)}
		</div>
	);
};

export default FixoraSelect;
