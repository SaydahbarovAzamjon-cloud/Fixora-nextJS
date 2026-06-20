import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import SearchIcon from '@mui/icons-material/Search';
import { buildTechnicianSearchUrl } from '../../utils/technicianSearchRoute';

interface NavSearchInputProps {
	compact?: boolean;
}

const NavSearchInput = ({ compact = false }: NavSearchInputProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [query, setQuery] = useState('');

	const submit = () => {
		router.push(buildTechnicianSearchUrl(query));
	};

	return (
		<form
			className={`fixora-nav__search${compact ? ' fixora-nav__search--compact' : ''}`}
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<SearchIcon className="fixora-nav__search-icon" fontSize="small" aria-hidden="true" />
			<input
				type="search"
				className="fixora-nav__search-input"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder={t('nav.searchPlaceholder')}
				aria-label={t('nav.searchPlaceholder')}
			/>
			<button type="submit" className="fixora-nav__search-btn" aria-label={t('nav.searchSubmit')}>
				<SearchIcon fontSize="inherit" />
			</button>
		</form>
	);
};

export default NavSearchInput;
