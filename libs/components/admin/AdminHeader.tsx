import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useLazyQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';
import { ADMIN_GLOBAL_SEARCH } from '../../../apollo/admin/query';
import type { AdminSearchHit } from '../../types/admin/admin';
import AdminNotificationBell from './AdminNotificationBell';
import AdminUserMenuButton from './AdminUserMenuButton';
import NavThemeToggle from '../nav/NavThemeToggle';

export interface AdminHeaderProps {
	title: string;
	subtitle?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle }) => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState('');
	const [resultsOpen, setResultsOpen] = useState(false);
	const searchRef = useRef<HTMLDivElement>(null);

	const [runSearch, { data: searchData, loading: searchLoading }] = useLazyQuery(ADMIN_GLOBAL_SEARCH, {
		fetchPolicy: 'network-only',
	});

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	useEffect(() => {
		if (debouncedQuery.length >= 2) {
			runSearch({ variables: { query: debouncedQuery, limit: 5 } });
			setResultsOpen(true);
		} else {
			setResultsOpen(false);
		}
	}, [debouncedQuery, runSearch]);

	useEffect(() => {
		const onDocClick = (e: MouseEvent) => {
			if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
				setResultsOpen(false);
			}
		};
		document.addEventListener('mousedown', onDocClick);
		return () => document.removeEventListener('mousedown', onDocClick);
	}, []);

	const hits: AdminSearchHit[] = [
		...(searchData?.adminGlobalSearch?.users ?? []),
		...(searchData?.adminGlobalSearch?.bookings ?? []),
		...(searchData?.adminGlobalSearch?.payments ?? []),
	];

	const navigateHit = (hit: AdminSearchHit) => {
		setResultsOpen(false);
		setSearchQuery('');
		if (hit.route) router.push(hit.route);
	};

	const searchField = (
		<div className="fixora-admin-search fixora-admin-search--header fixora-input" ref={searchRef}>
			<div className="fixora-input__field">
				<Search size={16} className="fixora-input__icon" />
				<input
					type="search"
					className="fixora-input__control"
					placeholder={t('header.searchPlaceholder')}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onFocus={() => debouncedQuery.length >= 2 && setResultsOpen(true)}
					aria-label={t('header.searchPlaceholder')}
				/>
			</div>
			{resultsOpen && debouncedQuery.length >= 2 && (
				<div className="fixora-admin-search__dropdown">
					{searchLoading && <div className="fixora-admin-search__item">{t('common.loading')}</div>}
					{!searchLoading && hits.length === 0 && (
						<div className="fixora-admin-search__item">{t('header.searchEmpty')}</div>
					)}
					{hits.map((hit) => (
						<button
							key={`${hit.route}-${hit._id}`}
							type="button"
							className="fixora-admin-search__item fixora-admin-search__item--btn"
							onClick={() => navigateHit(hit)}
						>
							<strong>{hit.label}</strong>
							{hit.subtitle && <span>{hit.subtitle}</span>}
						</button>
					))}
				</div>
			)}
		</div>
	);

	return (
		<header className="fixora-admin-header">
			<div className="fixora-admin-header__intro">
				<h1 className="fixora-admin-header__title">{title}</h1>
				{subtitle && <p className="fixora-admin-header__subtitle">{subtitle}</p>}
			</div>

			<div className="fixora-admin-header__toolbar fixora-admin-header__toolbar--desktop">
				{searchField}
				<NavThemeToggle compact />
				<AdminNotificationBell />
				<AdminUserMenuButton />
			</div>

			<div className="fixora-admin-header__toolbar fixora-admin-header__toolbar--mobile">
				{searchField}
				<NavThemeToggle compact />
			</div>
		</header>
	);
};

export default AdminHeader;
