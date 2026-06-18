import React from 'react';
import CheckOutlined from '@mui/icons-material/CheckOutlined';

interface SettingsSaveButtonProps {
	onClick?: () => void;
	loading?: boolean;
	disabled?: boolean;
	label?: string;
}

const SettingsSaveButton: React.FC<SettingsSaveButtonProps> = ({
	onClick,
	loading = false,
	disabled = false,
	label = 'Save Changes',
}) => (
	<button
		type="button"
		className="fts-save-btn"
		onClick={onClick}
		disabled={disabled || loading}
	>
		{loading ? (
			<span className="fts-save-btn__spinner" />
		) : (
			<CheckOutlined style={{ fontSize: 14 }} />
		)}
		{loading ? 'Saving…' : label}
	</button>
);

export default SettingsSaveButton;
