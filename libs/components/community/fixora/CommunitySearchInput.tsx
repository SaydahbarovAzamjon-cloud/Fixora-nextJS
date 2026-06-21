import React from 'react';
import SearchOutlined from '@mui/icons-material/SearchOutlined';

interface CommunitySearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
}

const CommunitySearchInput: React.FC<CommunitySearchInputProps> = ({
	value,
	onChange,
	placeholder,
}) => (
	<div className="fixora-community__search">
		<SearchOutlined className="fixora-community__search-icon" />
		<input
			type="search"
			className="fixora-community__search-input"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			aria-label={placeholder}
		/>
	</div>
);

export default CommunitySearchInput;
