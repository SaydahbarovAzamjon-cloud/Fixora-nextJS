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
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Logout } from '@mui/icons-material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { resolveProfileImageUrl } from '../utils/profileImage';
import { isTechnicianUser } from '../utils/userRole';
import { CLIENT_MY_PAGE, isClientMyPageRoute } from '../utils/clientMyPageRoute';
import { GET_NOTIFICATIONS, MARK_NOTIFICATION_READ, DELETE_NOTIFICATION } from '../../apollo/user/notification';
import { GET_MY_CONVERSATIONS } from '../../apollo/user/message';
import { Notification } from '../types/fixora/fixora';
import { getNotificationLink, filterNavbarNotifications } from '../utils/notifications';
import NotificationDropdown from './notifications/NotificationDropdown';
import NavSearchInput from './nav/NavSearchInput';
import useRealtimePollInterval from '../hooks/useRealtimePollInterval';

const LANGS = ['en', 'kr'] as const;

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
	const notifRef = useRef<HTMLDivElement>(null);
	const navPollMs = useRealtimePollInterval(30000);

	const { data: notificationsData, refetch: refetchNotifications } = useQuery(GET_NOTIFICATIONS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 20, sort: 'createdAt', direction: 'DESC' } },
		fetchPolicy: 'network-only',
		pollInterval: navPollMs,
	});

	const { data: unreadCountData, refetch: refetchUnreadCount } = useQuery(GET_NOTIFICATIONS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 50, search: { isRead: false } } },
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
	const unreadNotifications: number = filterNavbarNotifications(
		unreadCountData?.getNotifications?.list ?? [],
		isTechnician,
	).length;

	const unreadMessages: number = (conversationsData?.getMyConversations?.list ?? []).reduce(
		(sum: number, conversation: { unreadCount?: number }) => sum + (conversation.unreadCount ?? 0),
		0,
	);

	const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ);
	const [deleteNotification] = useMutation(DELETE_NOTIFICATION);

	/** LIFECYCLES **/
	useEffect(() => {
		if (localStorage.getItem('locale') === null) {
			localStorage.setItem('locale', 'en');
			setLang('en');
		} else {
			setLang(localStorage.getItem('locale') ?? 'en');
		}
	}, [router]);

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
		const closeMenu = () => setMenuOpen(false);
		router.events.on('routeChangeStart', closeMenu);
		return () => router.events.off('routeChangeStart', closeMenu);
	}, [router.events]);

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
			await Promise.all([refetchNotifications(), refetchUnreadCount()]);
		} catch {
			/* ignore */
		}
	};

	const handleNotificationClick = async (notification: Notification) => {
		setNotifOpen(false);
		if (!notification.isRead) {
			try {
				await markNotificationRead({ variables: { input: { notificationId: notification._id } } });
				await Promise.all([refetchNotifications(), refetchUnreadCount()]);
			} catch {
				/* ignore */
			}
		}
		const link = getNotificationLink(notification);
		if (link) router.push(link);
	};

	const homeHref = isTechnician ? '/technician/dashboard' : '/';

	const closeMenu = useCallback(() => setMenuOpen(false), []);

	const linkClass = (active: boolean, drawer = false) =>
		drawer
			? `fixora-nav-mobile__drawer-link${active ? ' fixora-nav-mobile__drawer-link--active' : ''}`
			: `fixora-nav__link${active ? ' fixora-nav__link--active' : ''}`;

	const renderNavLinks = (drawer = false, onNavigate?: () => void) => (
		<>
			{!isTechnician && (
				<Link href={'/'} className={linkClass(isActive('/'), drawer)} onClick={onNavigate}>
					{t('nav.home')}
				</Link>
			)}
			<Link
				href={'/technicians'}
				className={linkClass(isActive('/technicians'), drawer)}
				onClick={onNavigate}
			>
				{t('nav.technicians')}
			</Link>
			<Link href={'/search'} className={linkClass(isActive('/search'), drawer)} onClick={onNavigate}>
				{t('nav.services')}
			</Link>
			<Link
				href={'/community?articleCategory=FREE'}
				className={linkClass(isActive('/community'), drawer)}
				onClick={onNavigate}
			>
				{t('nav.community')}
			</Link>
			{user?._id &&
				(isTechnician ? (
					<Link
						href={'/technician/dashboard'}
						className={linkClass(isActive('/technician'), drawer)}
						onClick={onNavigate}
					>
						{t('nav.dashboard')}
					</Link>
				) : (
					<Link
						href={CLIENT_MY_PAGE}
						className={linkClass(isClientMyPageRoute(router.pathname), drawer)}
						onClick={onNavigate}
					>
						{t('nav.myPage')}
					</Link>
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
							onClick={() => setMenuOpen(true)}
							aria-label={t('nav.openMenu')}
							aria-expanded={menuOpen}
						>
							<MenuIcon />
						</button>

						<Link href={homeHref} onClick={goHome} className="fixora-nav-mobile__logo-link fixora-nav__logo-link">
							<FixoraLogo size="md" className="fixora-nav__logo" />
						</Link>

						<div className="fixora-nav-mobile__actions">
							{langToggle(true)}

							{user?._id ? (
								<>
									<Link href={messagesHref} className="fixora-nav-mobile__icon-link">
										<ChatBubbleOutlineIcon className="fixora-nav__bell" />
										{unreadMessages > 0 && <span className="fixora-nav__badge">{unreadMessages}</span>}
									</Link>
									<Link href={notificationsHref} className="fixora-nav-mobile__icon-link">
										<NotificationsOutlinedIcon className="fixora-nav__bell" />
										{unreadNotifications > 0 && (
											<span className="fixora-nav__badge">{unreadNotifications}</span>
										)}
									</Link>
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
						{langToggle()}

						{user?._id ? (
							<>
								<Link href={isTechnician ? '/technician/messages' : '/messages'} className={'fixora-nav__icon-link'}>
									<ChatBubbleOutlineIcon className={'fixora-nav__bell'} />
									{unreadMessages > 0 && <span className={'fixora-nav__badge'}>{unreadMessages}</span>}
								</Link>
								<div className={'fixora-nav__icon-link'} ref={notifRef}>
									<button
										type="button"
										className={'fixora-nav__icon-btn'}
										onClick={() => setNotifOpen((prev) => !prev)}
									>
										<NotificationsOutlinedIcon className={'fixora-nav__bell'} />
										{unreadNotifications > 0 && <span className={'fixora-nav__badge'}>{unreadNotifications}</span>}
									</button>
									{notifOpen && (
										<NotificationDropdown
											notifications={recentNotifications}
											onItemClick={handleNotificationClick}
											onDelete={handleNotificationDelete}
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
