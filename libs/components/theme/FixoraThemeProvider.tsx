import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, createTheme, Theme, ThemeOptions } from '@mui/material/styles';
import { fixoraDark, fixoraLight, fixoraTechnicianOrange } from '../../../scss/MaterialTheme';
import {
	applyFixoraThemeMode,
	DEFAULT_FIXORA_THEME_MODE,
	FixoraThemeMode,
	getStoredFixoraThemeMode,
	setStoredFixoraThemeMode,
} from '../../theme/fixoraThemeMode';

type FixoraThemeContextValue = {
	mode: FixoraThemeMode;
	setMode: (mode: FixoraThemeMode) => void;
	toggleMode: () => void;
	muiTheme: Theme;
	isTechnicianRoute: boolean;
};

const FixoraThemeContext = createContext<FixoraThemeContextValue | null>(null);

function resolveMuiTheme(mode: FixoraThemeMode, isTechnicianRoute: boolean): Theme {
	if (mode === 'light') {
		return createTheme(fixoraLight as ThemeOptions);
	}

	if (isTechnicianRoute) {
		return createTheme(fixoraTechnicianOrange as ThemeOptions);
	}

	return createTheme(fixoraDark as ThemeOptions);
}

type Props = {
	children: React.ReactNode;
	pathname: string;
};

export const FixoraThemeProvider: React.FC<Props> = ({ children, pathname }) => {
	const [mode, setModeState] = useState<FixoraThemeMode>(DEFAULT_FIXORA_THEME_MODE);
	const isTechnicianRoute = pathname.startsWith('/technician');

	useEffect(() => {
		const stored = getStoredFixoraThemeMode();
		setModeState(stored);
		applyFixoraThemeMode(stored);
	}, []);

	const setMode = useCallback((next: FixoraThemeMode) => {
		setModeState(next);
		setStoredFixoraThemeMode(next);
	}, []);

	const toggleMode = useCallback(() => {
		setMode(mode === 'dark' ? 'light' : 'dark');
	}, [mode, setMode]);

	const muiTheme = useMemo(() => resolveMuiTheme(mode, isTechnicianRoute), [mode, isTechnicianRoute]);

	const value = useMemo(
		() => ({
			mode,
			setMode,
			toggleMode,
			muiTheme,
			isTechnicianRoute,
		}),
		[mode, setMode, toggleMode, muiTheme, isTechnicianRoute],
	);

	return (
		<FixoraThemeContext.Provider value={value}>
			<ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
		</FixoraThemeContext.Provider>
	);
};

export function useFixoraTheme(): FixoraThemeContextValue {
	const ctx = useContext(FixoraThemeContext);
	if (!ctx) {
		throw new Error('useFixoraTheme must be used within FixoraThemeProvider');
	}
	return ctx;
}
