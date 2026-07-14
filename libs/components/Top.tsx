import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import { FixoraLogo } from './brand';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Logout } from '@mui/icons-material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { resolveProfileImageUrl } from '../utils/profileImage';
import { isTechnicianUser } from '../utils/userRole';
import { CLIENT_MY_PAGE, isClientMyPageRoute } from '../utils/clientMyPageRoute';
import { GET_NOTIFICATIONS, MARK_NOTIFICATION_READ, MARK_ALL_NOTIFICATIONS_READ, DELETE_NOTIFICATION } from '../../apollo/user/notification';
import { GET_MY_CONVERSATIONS } from '../../apollo/user/message';
import { Notification } from '../types/fixora/fixora';
import { getNotificationLink, filterNavbarNotifications } from '../utils/notifications';
import NotificationDropdown from './notifications/NotificationDropdown';
import NotificationBell from './layout/NotificationBell';
import NavSearchInput from './nav/NavSearchInput';
import NavThemeToggle from './nav/NavThemeToggle';
import useRealtimePollInterval from '../hooks/useRealtimePollInterval';
import { normalizeAppLocale } from '../utils/i18nLocale';
import { normalizeRoutePath } from '../utils/routePaths';
import { useNotificationContextOptional } from '../context/NotificationContext';

const LANGS = ['en', 'kr'] as const;
const NAV_ICON_SIZE = 18;

const formatNavBadge = (count: number) => (count > 99 ? '99+' : count);

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const isTechnician = isTechnicianUser(user);
	const { t } = useTranslation('common');
	const router = useRouter();
	const [lang, setLang] = useState<string>('en');
	const [colorChange, setColorChange] = useState(false);
	const [logoutAnchor, setLogoutAnchor] = useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	const [notifOpen, setNotifOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const menuIgnoreBackdropRef = useRef(false);
	const notifRef = useRef<HTMLDivElement>(null);
	const notifCtx = useNotificationContextOptional();
	const navPollMs = useRealtimePollInterval(30000);

	const { data: notificationsData, refetch: refetchNotifications } = useQuery(GET_NOTIFICATIONS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 20, sort: 'createdAt', direction: 'DESC' } },
		fetchPolicy: 'network-only',
		pollInterval: navPollMs,
	});

	const { data: conversationsData } = useQuery(GET_MY_CONVERSATIONS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 50 } },
		fetchPolicy: 'network-only',
		pollInterval: navPollMs,
	});

	// Messages → chat icon. Customers → booking notifications only (no like/follow/comment).
	const recentNotifications: Notification[] = filterNavbarNotifications(
		notificationsData?.getNotifications?.list ?? [],
		isTechnician,
	).slice(0, 8);
	const unreadNotifications: number = notifCtx?.unreadCount ?? filterNavbarNotifications(
		(notificationsData?.getNotifications?.list ?? []).filter((n: Notification) => !n.isRead),
		isTechnician,
	).length;

	const unreadMessages: number = (conversationsData?.getMyConversations?.list ?? []).reduce(
		(sum: number, conversation: { unreadCount?: number }) => sum + (conversation.unreadCount ?? 0),
		0,
	);

	const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ);
	const [markAllNotificationsRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);
	const [deleteNotification] = useMutation(DELETE_NOTIFICATION);

	/** LIFECYCLES **/
	useEffect(() => {
		const stored = normalizeAppLocale(localStorage.getItem('locale'));
		localStorage.setItem('locale', stored);
		setLang(stored);
		if (router.locale && router.locale !== stored) {
			void router.replace(router.asPath, router.asPath, { locale: stored });
		}
	}, [router.locale, router.asPath]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		const changeNavbarColor = () => setColorChange(window.scrollY >= 50);
		window.addEventListener('scroll', changeNavbarColor);
		return () => window.removeEventListener('scroll', changeNavbarColor);
	}, []);

	useEffect(() => {
		if (!notifOpen) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
				setNotifOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [notifOpen]);

	useEffect(() => {
		if (!menuOpen) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [menuOpen]);

	useEffect(() => {
		const closeMenu = (url: string) => {
			const nextPath = url.split('?')[0].split('#')[0];
			if (normalizeRoutePath(nextPath) !== normalizeRoutePath(router.pathname)) {
				setMenuOpen(false);
			}
		};
		router.events.on('routeChangeStart', closeMenu);
		return () => router.events.off('routeChangeStart', closeMenu);
	}, [router.events, router.pathname]);

	/** HANDLERS **/
	const langChoice = useCallback(
		async (locale: string) => {
			setLang(locale);
			localStorage.setItem('locale', locale);
			await router.push(router.asPath, router.asPath, { locale });
		},
		[router],
	);

	const isActive = (path: string) =>
		path === '/' ? router.pathname === '/' : router.pathname.startsWith(path);

	const goHome = useCallback(() => {
		if (router.pathname === '/') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}, [router.pathname]);

	const handleNotificationDelete = async (notification: Notification) => {
		try {
			await deleteNotification({ variables: { notificationId: notification._id } });
			if (!notification.isRead) notifCtx?.decrementUnread();
			await refetchNotifications();
		} catch {
			/* ignore */
		}
	};

	const handleMarkAllNotificationsRead = async () => {
		try {
			await markAllNotificationsRead();
			notifCtx?.clearUnread();
			await Promise.all([refetchNotifications(), notifCtx?.refetchNotifications()]);
		} catch {
			/* ignore */
		}
	};

	const handleNotificationClick = async (notification: Notification) => {
		setNotifOpen(false);
		if (!notification.isRead) {
			try {
				await markNotificationRead({ variables: { input: { notificationId: notification._id } } });
				notifCtx?.decrementUnread();
				await refetchNotifications();
			} catch {
				/* ignore */
			}
		}
		const link = getNotificationLink(notification, { isTechnician });
		if (link) router.push(link);
	};

	const homeHref = isTechnician ? '/technician/dashboard' : '/';

	const closeMenu = useCallback(() => {
		if (menuIgnoreBackdropRef.current) return;
		setMenuOpen(false);
	}, []);

	const toggleMenu = useCallback(() => {
		setMenuOpen((open) => {
			if (open) return false;
			menuIgnoreBackdropRef.current = true;
			window.setTimeout(() => {
				menuIgnoreBackdropRef.current = false;
			}, 400);
			return true;
		});
	}, []);

	const linkClass = (active: boolean, drawer = false) =>
		drawer
			? `fixora-nav-mobile__drawer-link${active ? ' fixora-nav-mobile__drawer-link--active' : ''}`
			: `fixora-nav__link${active ? ' fixora-nav__link--active' : ''}`;

	const renderNavLink = (
		href: string,
		label: string,
		icon: React.ReactNode,
		active: boolean,
		drawer = false,
		onNavigate?: () => void,
	) => (
		<Link
			key={href}
			href={href}
			className={linkClass(active, drawer)}
			onClick={onNavigate}
		>
			<span className="fixora-nav__link-icon" aria-hidden="true">
				{icon}
			</span>
			<span className="fixora-nav__link-label">{label}</span>
		</Link>
	);

	const renderNavLinks = (drawer = false, onNavigate?: () => void) => (
		<>
			{!isTechnician &&
				renderNavLink('/', t('nav.home'), <HomeOutlinedIcon sx={{ fontSize: NAV_ICON_SIZE }} />, isActive('/'), drawer, onNavigate)}
			{renderNavLink(
				'/technicians',
				t('nav.technicians'),
				<HandymanOutlinedIcon sx={{ fontSize: NAV_ICON_SIZE }} />,
				isActive('/technicians'),
				drawer,
				onNavigate,
			)}
			{renderNavLink(
				'/search',
				t('nav.services'),
				<SearchOutlinedIcon sx={{ fontSize: NAV_ICON_SIZE }} />,
				isActive('/search'),
				drawer,
				onNavigate,
			)}
			{renderNavLink(
				'/community?articleCategory=FREE',
				t('nav.community'),
				<GroupsOutlinedIcon sx={{ fontSize: NAV_ICON_SIZE }} />,
				isActive('/community'),
				drawer,
				onNavigate,
			)}
			{user?._id &&
				(isTechnician
					? renderNavLink(
							'/technician/dashboard',
							t('nav.dashboard'),
							<BuildOutlinedIcon sx={{ fontSize: NAV_ICON_SIZE }} />,
							isActive('/technician'),
							drawer,
							onNavigate,
						)
					: renderNavLink(
							CLIENT_MY_PAGE,
							t('nav.myPage'),
							<PersonOutlineOutlinedIcon sx={{ fontSize: NAV_ICON_SIZE }} />,
							isClientMyPageRoute(router.pathname),
							drawer,
							onNavigate,
						))}
		</>
	);

	const navLinks = renderNavLinks();

	const langToggle = (compact = false) => (
		<div className={compact ? 'fixora-nav-mobile__lang' : 'fixora-nav__lang'}>
			{LANGS.map((code, idx) => (
				<React.Fragment key={code}>
					{idx > 0 && <span className="fixora-nav__lang-divider">|</span>}
					<button
						type="button"
						className={`fixora-nav__lang-btn ${lang === code ? 'fixora-nav__lang-btn--active' : ''}`}
						onClick={() => langChoice(code)}
					>
						{code.toUpperCase()}
					</button>
				</React.Fragment>
			))}
		</div>
	);

	if (device == 'mobile') {
		const messagesHref = isTechnician ? '/technician/messages' : '/messages';
		const notificationsHref = isTechnician ? '/technician/notifications' : '/notifications';

		return (
			<>
				<Stack className={'top fixora-nav--mobile'}>
					<div className="fixora-nav-mobile__bar">
						<button
							type="button"
							className="fixora-nav-mobile__menu-btn"
							onClick={toggleMenu}
							aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
							aria-expanded={menuOpen}
						>
							<MenuIcon />
						</button>

						<Link href={homeHref} onClick={goHome} className="fixora-nav-mobile__logo-link fixora-nav__logo-link">
							<FixoraLogo size="md" className="fixora-nav__logo" />
						</Link>

						<div className="fixora-nav-mobile__actions">
							<NavThemeToggle compact />
							{langToggle(true)}

							{user?._id ? (
								<>
									<Link href={messagesHref} className="fixora-nav-mobile__icon-link">
										<span className="fixora-nav__icon-wrap">
											<ChatBubbleOutlineIcon className="fixora-nav__bell" />
											{unreadMessages > 0 && (
												<span className="fixora-nav__badge">{formatNavBadge(unreadMessages)}</span>
											)}
										</span>
									</Link>
									<NotificationBell href={notificationsHref} unreadCount={unreadNotifications} />
									<button
										type="button"
										className="fixora-nav-mobile__avatar"
										onClick={(event) => setLogoutAnchor(event.currentTarget)}
									>
										<img src={resolveProfileImageUrl(user?.memberImage)} alt="" />
									</button>
								</>
							) : (
								<>
									<Link href={'/login'} className="fixora-nav-mobile__login">
										{t('nav.login')}
									</Link>
									<Link href={'/search'} className="fixora-nav-mobile__cta">
										{t('nav.findTechnician')}
									</Link>
								</>
							)}
						</div>
					</div>
				</Stack>

				{menuOpen && (
					<>
						<button
							type="button"
							className="fixora-nav-mobile__backdrop"
							onPointerDown={(event) => event.preventDefault()}
							onClick={closeMenu}
							aria-label={t('nav.closeMenu')}
						/>
						<aside className="fixora-nav-mobile__drawer" role="dialog" aria-modal="true" aria-label={t('nav.menu')}>
							<div className="fixora-nav-mobile__drawer-head">
								<p className="fixora-nav-mobile__drawer-title">{t('nav.menu')}</p>
								<button
									type="button"
									className="fixora-nav-mobile__drawer-close"
									onClick={closeMenu}
									aria-label={t('nav.closeMenu')}
								>
									<CloseIcon />
								</button>
							</div>

							<div className="fixora-nav-mobile__drawer-search">
								<NavSearchInput compact />
							</div>

							<nav className="fixora-nav-mobile__drawer-nav">
								{renderNavLinks(true, closeMenu)}
							</nav>

							{user?._id && (
								<div className="fixora-nav-mobile__drawer-footer">
									<button
										type="button"
										className="fixora-nav-mobile__drawer-logout"
										onClick={() => {
											closeMenu();
											logOut();
										}}
									>
										<Logout fontSize="small" />
										{t('nav.logout')}
									</button>
								</div>
							)}
						</aside>
					</>
				)}

				<Menu anchorEl={logoutAnchor} open={logoutOpen} onClose={() => setLogoutAnchor(null)} sx={{ mt: '5px' }}>
					<MenuItem onClick={() => logOut()}>
						<Logout fontSize="small" style={{ marginRight: '10px' }} />
						{t('nav.logout')}
					</MenuItem>
				</Menu>
			</>
		);
	}

	return (
		<Stack className={'navbar'}>
			<Stack className={`navbar-main ${colorChange ? 'transparent' : ''}`}>
				<Stack className={'container'}>
					<Box component={'div'} className={'logo-box'}>
						<Link href={homeHref} onClick={goHome} className="fixora-nav__logo-link">
							<FixoraLogo size="md" className="fixora-nav__logo" />
						</Link>
					</Box>

					<Box component={'div'} className={'fixora-nav__links'}>
						{navLinks}
					</Box>

					<NavSearchInput />

					<Box component={'div'} className={'fixora-nav__actions'}>
						<NavThemeToggle />
						{langToggle()}

						{user?._id ? (
							<>
								<Link href={isTechnician ? '/technician/messages' : '/messages'} className={'fixora-nav__icon-link'}>
									<span className="fixora-nav__icon-wrap">
										<ChatBubbleOutlineIcon className={'fixora-nav__bell'} />
										{unreadMessages > 0 && (
											<span className={'fixora-nav__badge'}>{formatNavBadge(unreadMessages)}</span>
										)}
									</span>
								</Link>
								<div className={'fixora-nav__icon-link'} ref={notifRef}>
									<NotificationBell
										onClick={() => setNotifOpen((prev) => !prev)}
										unreadCount={unreadNotifications}
									/>
									{notifOpen && (
										<NotificationDropdown
											notifications={recentNotifications}
											onItemClick={handleNotificationClick}
											onDelete={handleNotificationDelete}
											onMarkAllRead={handleMarkAllNotificationsRead}
											onViewAll={() => setNotifOpen(false)}
											viewAllHref={isTechnician ? '/technician/notifications' : '/notifications'}
										/>
									)}
								</div>
								<button
									type="button"
									className={'fixora-nav__avatar'}
									onClick={(event) => setLogoutAnchor(event.currentTarget)}
								>
									<img src={resolveProfileImageUrl(user?.memberImage)} alt="" />
								</button>
								<Menu
									anchorEl={logoutAnchor}
									open={logoutOpen}
									onClose={() => setLogoutAnchor(null)}
									sx={{ mt: '5px' }}
								>
									<MenuItem onClick={() => logOut()}>
										<Logout fontSize="small" style={{ marginRight: '10px' }} />
										{t('nav.logout')}
									</MenuItem>
								</Menu>
							</>
						) : (
							<>
								<Link href={'/login'} className={'fixora-nav__login'}>
									{t('nav.login')}
								</Link>
								<Link href={'/search'} className={'fixora-nav__cta'}>
									{t('nav.findTechnician')}
								</Link>
							</>
						)}
					</Box>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withRouter(Top);
