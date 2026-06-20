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
import { Logout } from '@mui/icons-material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { resolveProfileImageUrl } from '../utils/profileImage';
import { GET_NOTIFICATIONS, MARK_NOTIFICATION_READ } from '../../apollo/user/notification';
import { GET_MY_CONVERSATIONS } from '../../apollo/user/message';
import { Notification } from '../types/fixora/fixora';
import { getNotificationLink } from '../utils/notifications';
import NotificationDropdown from './notifications/NotificationDropdown';
import NavSearchInput from './nav/NavSearchInput';

const LANGS = ['en', 'kr'] as const;

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const router = useRouter();
	const [lang, setLang] = useState<string>('en');
	const [colorChange, setColorChange] = useState(false);
	const [logoutAnchor, setLogoutAnchor] = useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	const [notifOpen, setNotifOpen] = useState(false);
	const notifRef = useRef<HTMLDivElement>(null);

	const { data: notificationsData, refetch: refetchNotifications } = useQuery(GET_NOTIFICATIONS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 20, sort: 'createdAt', direction: 'DESC' } },
		fetchPolicy: 'network-only',
		pollInterval: 30000,
	});

	const { data: unreadCountData, refetch: refetchUnreadCount } = useQuery(GET_NOTIFICATIONS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 50, search: { isRead: false } } },
		fetchPolicy: 'network-only',
		pollInterval: 30000,
	});

	const { data: conversationsData } = useQuery(GET_MY_CONVERSATIONS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 50 } },
		fetchPolicy: 'network-only',
		pollInterval: 30000,
	});

	// Messages have their own icon + badge, so they're excluded from the notification bell.
	const recentNotifications: Notification[] = (notificationsData?.getNotifications?.list ?? [])
		.filter((n: Notification) => n.notificationType !== 'MESSAGE')
		.slice(0, 8);
	const unreadNotifications: number = (unreadCountData?.getNotifications?.list ?? []).filter(
		(n: Notification) => n.notificationType !== 'MESSAGE',
	).length;

	const unreadMessages: number = (conversationsData?.getMyConversations?.list ?? []).reduce(
		(sum: number, conversation: { unreadCount?: number }) => sum + (conversation.unreadCount ?? 0),
		0,
	);

	const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ);

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

	const navLinks = (
		<>
			<Link href={'/'} className={`fixora-nav__link ${isActive('/') ? 'fixora-nav__link--active' : ''}`}>
				{t('nav.home')}
			</Link>
			<Link
				href={'/technicians'}
				className={`fixora-nav__link ${isActive('/technicians') ? 'fixora-nav__link--active' : ''}`}
			>
				{t('nav.technicians')}
			</Link>
			<Link
				href={'/search'}
				className={`fixora-nav__link ${isActive('/search') ? 'fixora-nav__link--active' : ''}`}
			>
				{t('nav.services')}
			</Link>
			<Link
				href={'/community?articleCategory=FREE'}
				className={`fixora-nav__link ${isActive('/community') ? 'fixora-nav__link--active' : ''}`}
			>
				{t('nav.community')}
			</Link>
			{user?._id && (
				<Link
					href={'/mypage'}
					className={`fixora-nav__link ${isActive('/mypage') ? 'fixora-nav__link--active' : ''}`}
				>
					{t('nav.myPage')}
				</Link>
			)}
		</>
	);

	const langToggle = (
		<div className="fixora-nav__lang">
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
		return (
			<Stack className={'top fixora-nav--mobile'}>
				<Link href={'/'} onClick={goHome} className="fixora-nav__logo-link">
					<FixoraLogo size="md" className="fixora-nav__logo" />
				</Link>
				<NavSearchInput compact />
				<div className="fixora-nav__links">{navLinks}</div>
				{user?._id && (
					<button
						type="button"
						className={'fixora-nav__avatar'}
						onClick={(event) => setLogoutAnchor(event.currentTarget)}
					>
						<img src={resolveProfileImageUrl(user?.memberImage)} alt="" />
					</button>
				)}
				<Menu anchorEl={logoutAnchor} open={logoutOpen} onClose={() => setLogoutAnchor(null)} sx={{ mt: '5px' }}>
					<MenuItem onClick={() => logOut()}>
						<Logout fontSize="small" style={{ marginRight: '10px' }} />
						{t('nav.logout')}
					</MenuItem>
				</Menu>
			</Stack>
		);
	}

	return (
		<Stack className={'navbar'}>
			<Stack className={`navbar-main ${colorChange ? 'transparent' : ''}`}>
				<Stack className={'container'}>
					<Box component={'div'} className={'logo-box'}>
						<Link href={'/'} onClick={goHome} className="fixora-nav__logo-link">
							<FixoraLogo size="md" className="fixora-nav__logo" />
						</Link>
					</Box>

					<Box component={'div'} className={'fixora-nav__links'}>
						{navLinks}
					</Box>

					<NavSearchInput />

					<Box component={'div'} className={'fixora-nav__actions'}>
						{langToggle}

						{user?._id ? (
							<>
								<Link href={'/messages'} className={'fixora-nav__icon-link'}>
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
											onViewAll={() => setNotifOpen(false)}
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
