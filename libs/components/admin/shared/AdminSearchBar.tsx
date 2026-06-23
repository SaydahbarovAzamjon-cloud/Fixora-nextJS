import React from 'react';
import { Search } from 'lucide-react';

interface AdminSearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	className?: string;
	disabled?: boolean;
}

const AdminSearchBar: React.FC<AdminSearchBarProps> = ({ value, onChange, placeholder, className = '', disabled }) => (
	<div className={`fixora-admin-search fixora-input ${className}`.trim()}>
		<div className="fixora-input__field fixora-admin-search__field">
			<Search size={16} className="fixora-input__icon" />
			<input
				type="search"
				className="fixora-input__control fixora-admin-search__input"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
			/>
		</div>
	</div>
);

export default AdminSearchBar;
