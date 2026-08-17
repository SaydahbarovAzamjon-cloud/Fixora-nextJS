import React from 'react';
import ArrowBack from '@mui/icons-material/ArrowBack';

interface AuthNavBackProps {
	label: string;
	onClick: () => void;
}

/** Top-left back control for multi-step auth screens (role → form). */
const AuthNavBack = ({ label, onClick }: AuthNavBackProps) => {
	return (
		<button type="button" className="auth-nav-back" onClick={onClick} aria-label={label}>
			<ArrowBack fontSize="small" />
			<span>{label}</span>
		</button>
	);
};

export default AuthNavBack;
