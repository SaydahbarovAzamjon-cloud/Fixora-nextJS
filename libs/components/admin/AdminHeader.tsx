import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useLazyQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { userVar } from '../../../apollo/store';
import { ADMIN_GLOBAL_SEARCH } from '../../../apollo/admin/query';
import { displayUserName } from '../../hooks/useUserLookup';
import type { AdminSearchHit } from '../../types/admin/admin';

export interface AdminHeaderProps {
	title: string;
	subtitle?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle }) => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [menuOpen, setMenuOpen] = useState(false);
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

	const displayName = displayUserName(user as Parameters<typeof displayUserName>[0]) || t('nav.admin');
	const initials = displayName.charAt(0).toUpperCase();

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

	return (
		<header className="fixora-admin-header">
			<div className="fixora-admin-header__titles">
				<h1 className="fixora-admin-header__title">{title}</h1>
				{subtitle && <p className="fixora-admin-header__subtitle">{subtitle}</p>}
			</div>

			<div className="fixora-admin-header__actions">
				<div className="fixora-admin-search fixora-admin-search--header" ref={searchRef}>
					<Search size={16} className="fixora-admin-search__icon" />
					<input
						type="search"
						className="fixora-admin-search__input"
						placeholder={t('header.searchPlaceholder')}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onFocus={() => debouncedQuery.length >= 2 && setResultsOpen(true)}
						aria-label={t('header.searchPlaceholder')}
					/>
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

				<button type="button" className="fixora-admin-header__bell" aria-label={t('header.notifications')}>
					<Bell size={18} />
					<span className="fixora-admin-header__bell-dot" />
				</button>

				<div className="fixora-admin-header__user-wrap">
					<button
						type="button"
						className="fixora-admin-header__user"
						onClick={() => setMenuOpen((v) => !v)}
						aria-expanded={menuOpen}
					>
						<div className="fixora-admin-header__avatar">{initials}</div>
						<span className="fixora-admin-header__name">{displayName}</span>
						<ChevronDown size={14} />
					</button>
				</div>
			</div>
		</header>
	);
};

export default AdminHeader;
