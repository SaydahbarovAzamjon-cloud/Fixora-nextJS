import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Stack, Box } from '@mui/material';
import Link from 'next/link';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import { FixoraLogo } from './brand';

const SOCIAL_LINKS = [
	{ key: 'facebook', Icon: FacebookOutlinedIcon },
	{ key: 'telegram', Icon: TelegramIcon },
	{ key: 'instagram', Icon: InstagramIcon },
	{ key: 'twitter', Icon: TwitterIcon },
] as const;

const Footer = () => {
	const { t } = useTranslation('common');
	const year = moment().year();

	return (
		<Stack className="footer-container fixora-footer">
			<Box component="div" className="fixora-footer__grid">
				<Box component="div" className="fixora-footer__newsletter-title">
					<strong>{t('footer.newsletter.title')}</strong>
				</Box>

				<Box component="div" className="fixora-footer__logo-scene">
					<Box component="div" className="fixora-footer__logo-spin">
						<FixoraLogo size="md" className="fixora-footer__logo" />
					</Box>
				</Box>

				<Box component="div" className="fixora-footer__newsletter-input">
					<input type="email" placeholder={t('footer.newsletter.placeholder')} />
					<span>{t('footer.newsletter.subscribe')}</span>
				</Box>

				<Stack className="fixora-footer__contact">
					<Box component="div" className="footer-box">
						<span>{t('footer.support.title')}</span>
						<p className="fixora-footer__phone">{t('footer.support.phone')}</p>
					</Box>
					<Box component="div" className="footer-box">
						<span>{t('footer.live.title')}</span>
						<p className="fixora-footer__phone">{t('footer.support.phone')}</p>
					</Box>
					<Box component="div" className="footer-box">
						<p className="fixora-footer__social-label">{t('footer.social.title')}</p>
						<div className="media-box">
							{SOCIAL_LINKS.map(({ key, Icon }) => (
								<a
									key={key}
									href="#"
									className="fixora-footer__social-link"
									aria-label={t(`footer.social.${key}`)}
								>
									<Icon />
								</a>
							))}
						</div>
					</Box>
				</Stack>

				<Box component="div" className="fixora-footer__links fixora-footer__links--popular">
					<strong className="fixora-footer__heading">{t('footer.popular.title')}</strong>
					<Link href="/search?q=iPhone+repair" className="fixora-footer__link">
						{t('footer.popular.iphone')}
					</Link>
					<Link href="/search?q=MacBook+repair" className="fixora-footer__link">
						{t('footer.popular.macbook')}
					</Link>
					<Link href="/search?q=screen+replacement" className="fixora-footer__link">
						{t('footer.popular.screen')}
					</Link>
					<Link href="/search?q=battery+replacement" className="fixora-footer__link">
						{t('footer.popular.battery')}
					</Link>
				</Box>

				<Box component="div" className="fixora-footer__links fixora-footer__links--quick">
					<strong className="fixora-footer__heading">{t('footer.links.title')}</strong>
					<span className="fixora-footer__link">{t('footer.links.terms')}</span>
					<span className="fixora-footer__link">{t('footer.links.privacy')}</span>
					<Link href="/search" className="fixora-footer__link">
						{t('footer.links.services')}
					</Link>
					<span className="fixora-footer__link">{t('footer.links.support')}</span>
					<span className="fixora-footer__link">{t('footer.links.faqs')}</span>
				</Box>

				<Box component="div" className="fixora-footer__discover">
					<strong className="fixora-footer__heading">{t('footer.discover.title')}</strong>
					<Link href="/search?location=Seoul" className="fixora-footer__link">
						{t('footer.discover.seoul')}
					</Link>
					<Link href="/search?location=Busan" className="fixora-footer__link">
						{t('footer.discover.busan')}
					</Link>
					<Link href="/search?location=Incheon" className="fixora-footer__link">
						{t('footer.discover.incheon')}
					</Link>
					<Link href="/search?location=Daegu" className="fixora-footer__link">
						{t('footer.discover.daegu')}
					</Link>
				</Box>
			</Box>

			<Stack className="second">
				<span>{t('footer.copyright', { year })}</span>
				<span className="fixora-footer__legal">{t('footer.legal')}</span>
			</Stack>
		</Stack>
	);
};

export default Footer;
