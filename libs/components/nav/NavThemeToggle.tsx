import React from 'react';
import { useTranslation } from 'next-i18next';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useFixoraTheme } from '../theme/FixoraThemeProvider';

interface NavThemeToggleProps {
	compact?: boolean;
	className?: string;
}

const NavThemeToggle: React.FC<NavThemeToggleProps> = ({ compact = false, className = '' }) => {
	const { t } = useTranslation('common');
	const { mode, toggleMode } = useFixoraTheme();
	const isDark = mode === 'dark';
	const label = isDark ? t('nav.switchToLight') : t('nav.switchToDark');

	return (
		<button
			type="button"
			className={`fixora-nav__theme-toggle${compact ? ' fixora-nav__theme-toggle--compact' : ''}${className ? ` ${className}` : ''}`}
			onClick={toggleMode}
			aria-label={label}
			aria-pressed={isDark}
			title={label}
		>
			{isDark ? (
				<LightModeOutlinedIcon fontSize={compact ? 'small' : 'medium'} />
			) : (
				<DarkModeOutlinedIcon fontSize={compact ? 'small' : 'medium'} />
			)}
		</button>
	);
};

export default NavThemeToggle;
