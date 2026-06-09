import React, { InputHTMLAttributes, ReactNode, useState } from 'react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export interface FixoraInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
	label?: string;
	icon?: ReactNode;
	error?: boolean;
	helperText?: string;
}

const FixoraInput = ({
	label,
	icon,
	error = false,
	helperText,
	type = 'text',
	id,
	className = '',
	...rest
}: FixoraInputProps) => {
	const [showPassword, setShowPassword] = useState(false);
	const isPassword = type === 'password';
	const inputId = id || rest.name;
	const inputType = isPassword && showPassword ? 'text' : type;

	return (
		<div className={`fixora-input ${className}`.trim()}>
			{label && (
				<label className="fixora-input__label" htmlFor={inputId}>
					{label}
				</label>
			)}
			<div className={`fixora-input__field${error ? ' fixora-input__field--error' : ''}`}>
				{icon && <span className="fixora-input__icon">{icon}</span>}
				<input
					id={inputId}
					type={inputType}
					className="fixora-input__control"
					aria-invalid={error || undefined}
					{...rest}
				/>
				{isPassword && (
					<button
						type="button"
						className="fixora-input__toggle"
						onClick={() => setShowPassword((prev) => !prev)}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
					</button>
				)}
			</div>
			{helperText && (
				<span className={`fixora-input__helper${error ? ' fixora-input__helper--error' : ''}`}>
					{helperText}
				</span>
			)}
		</div>
	);
};

export default FixoraInput;
