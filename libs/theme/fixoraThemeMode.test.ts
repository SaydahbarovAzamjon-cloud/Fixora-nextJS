import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	DEFAULT_FIXORA_THEME_MODE,
	FIXORA_THEME_BOOTSTRAP_SCRIPT,
	FIXORA_THEME_STORAGE_KEY,
	applyFixoraThemeMode,
	getStoredFixoraThemeMode,
	isFixoraThemeMode,
	resetFixoraThemeModeToLight,
	setStoredFixoraThemeMode,
} from './fixoraThemeMode';

describe('fixoraThemeMode', () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute('data-theme');
		document.documentElement.classList.remove('theme-light');
	});

	afterEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute('data-theme');
		document.documentElement.classList.remove('theme-light');
	});

	it('isFixoraThemeMode accepts dark and light only', () => {
		expect(isFixoraThemeMode('dark')).toBe(true);
		expect(isFixoraThemeMode('light')).toBe(true);
		expect(isFixoraThemeMode('system')).toBe(false);
	});

	it('getStoredFixoraThemeMode returns default when empty', () => {
		expect(getStoredFixoraThemeMode()).toBe(DEFAULT_FIXORA_THEME_MODE);
	});

	it('setStoredFixoraThemeMode persists and applies light theme to DOM', () => {
		setStoredFixoraThemeMode('light');
		expect(localStorage.getItem(FIXORA_THEME_STORAGE_KEY)).toBe('light');
		expect(document.documentElement.getAttribute('data-theme')).toBe('light');
		expect(document.documentElement.classList.contains('theme-light')).toBe(true);
	});

	it('applyFixoraThemeMode removes light class when switching to dark', () => {
		applyFixoraThemeMode('light');
		applyFixoraThemeMode('dark');
		expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
		expect(document.documentElement.classList.contains('theme-light')).toBe(false);
	});

	it('resetFixoraThemeModeToLight clears a stored dark preference', () => {
		setStoredFixoraThemeMode('dark');
		expect(resetFixoraThemeModeToLight()).toBe('light');
		expect(localStorage.getItem(FIXORA_THEME_STORAGE_KEY)).toBe('light');
		expect(document.documentElement.getAttribute('data-theme')).toBe('light');
		expect(document.documentElement.classList.contains('theme-light')).toBe(true);
	});

	it('bootstrap script always forces light (ignores prior dark)', () => {
		localStorage.setItem(FIXORA_THEME_STORAGE_KEY, 'dark');
		// Evaluate the same inline bootstrap used in _document
		Function(FIXORA_THEME_BOOTSTRAP_SCRIPT)();
		expect(localStorage.getItem(FIXORA_THEME_STORAGE_KEY)).toBe('light');
		expect(document.documentElement.getAttribute('data-theme')).toBe('light');
		expect(document.documentElement.classList.contains('theme-light')).toBe(true);
	});
});
