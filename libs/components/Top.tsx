import React, { useCallback, useEffect, useState } from 'react';
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
import { Logout } from '@mui/icons-material';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { REACT_APP_API_URL } from '../config';

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

	const navLinks = (
		<>
			<Link href={'/'} className={`fixora-nav__link ${isActive('/') ? 'fixora-nav__link--active' : ''}`}>
				{t('nav.home')}
			</Link>
			<Link
				href={'/agent'}
				className={`fixora-nav__link ${isActive('/agent') ? 'fixora-nav__link--active' : ''}`}
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
				<Link href={'/'}>
					<FixoraLogo size="sm" />
				</Link>
				<div className="fixora-nav__links">{navLinks}</div>
			</Stack>
		);
	}

	return (
		<Stack className={'navbar'}>
			<Stack className={`navbar-main ${colorChange ? 'transparent' : ''}`}>
				<Stack className={'container'}>
					<Box component={'div'} className={'logo-box'}>
						<Link href={'/'}>
							<FixoraLogo size="sm" />
						</Link>
					</Box>

					<Box component={'div'} className={'fixora-nav__links'}>
						{navLinks}
					</Box>

					<Box component={'div'} className={'fixora-nav__actions'}>
						{langToggle}

						{user?._id ? (
							<>
								<NotificationsOutlinedIcon className={'fixora-nav__bell'} />
								<button
									type="button"
									className={'fixora-nav__avatar'}
									onClick={(event) => setLogoutAnchor(event.currentTarget)}
								>
									<img
										src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
										alt=""
									/>
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
								<Link href={'/agent'} className={'fixora-nav__cta'}>
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
