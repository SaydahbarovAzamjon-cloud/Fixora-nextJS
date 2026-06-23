import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useLazyQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Search, ChevronDown, Settings, LogOut } from 'lucide-react';
import { userVar } from '../../../apollo/store';
import { ADMIN_GLOBAL_SEARCH } from '../../../apollo/admin/query';
import { logOut } from '../../auth';
import { displayUserName } from '../../hooks/useUserLookup';
import type { AdminSearchHit } from '../../types/admin/admin';
import AdminAvatar from './AdminAvatar';
import AdminNotificationBell from './AdminNotificationBell';

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
	const userMenuRef = useRef<HTMLDivElement>(null);

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
			if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
				setMenuOpen(false);
			}
		};
		document.addEventListener('mousedown', onDocClick);
		return () => document.removeEventListener('mousedown', onDocClick);
	}, []);

	const displayName = displayUserName(user as Parameters<typeof displayUserName>[0]) || t('nav.admin');
	const profileImage = user?.memberImage || (user as { userProfileImage?: string | null })?.userProfileImage;

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

	const handleLogout = () => {
		setMenuOpen(false);
		logOut();
		router.push('/login').then();
	};

	return (
		<header className="fixora-admin-header">
			<div className="fixora-admin-header__titles">
				<h1 className="fixora-admin-header__title">{title}</h1>
				{subtitle && <p className="fixora-admin-header__subtitle">{subtitle}</p>}
			</div>

			<div className="fixora-admin-header__actions">
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

				<AdminNotificationBell />

				<div className="fixora-admin-header__user-wrap" ref={userMenuRef}>
					<button
						type="button"
						className="fixora-admin-header__user"
						onClick={() => setMenuOpen((v) => !v)}
						aria-expanded={menuOpen}
					>
						<AdminAvatar image={profileImage} name={displayName} size="sm" className="fixora-admin-header__avatar" />
						<span className="fixora-admin-header__name">{displayName}</span>
						<ChevronDown size={14} />
					</button>
					{menuOpen && (
						<div className="fixora-admin-header__user-menu" role="menu">
							<button
								type="button"
								className="fixora-admin-header__user-menu-item"
								role="menuitem"
								onClick={() => {
									setMenuOpen(false);
									router.push('/_admin/settings');
								}}
							>
								<Settings size={16} />
								{t('header.settings')}
							</button>
							<button
								type="button"
								className="fixora-admin-header__user-menu-item fixora-admin-header__user-menu-item--danger"
								role="menuitem"
								onClick={handleLogout}
							>
								<LogOut size={16} />
								{t('header.logout')}
							</button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default AdminHeader;
