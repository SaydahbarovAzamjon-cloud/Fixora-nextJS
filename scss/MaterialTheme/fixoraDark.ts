import shadow from './shadow';
import typography from './typography';

/**
 * FIXORA DARK THEME (MVP default) — premium burgundy customer palette
 */
export const fixoraDark = {
	palette: {
		mode: 'dark' as const,
		primary: {
			main: '#730C1E',
			light: '#8E1428',
			dark: '#480415',
			contrastText: '#FFFFFF',
		},
		secondary: {
			main: '#BDBDBD',
			contrastText: '#FFFFFF',
		},
		background: {
			default: '#140F17',
			paper: '#241414',
		},
		text: {
			primary: '#F5F5F5',
			secondary: '#BDBDBD',
			disabled: '#8A8A8A',
		},
		error: {
			main: '#FF4D4F',
		},
		success: {
			main: '#52C41A',
		},
		divider: 'rgba(115, 12, 30, 0.25)',
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				html: {
					height: '100%',
				},
				body: {
					fontFamily: '"Plus Jakarta Sans", "Manrope", "Inter", sans-serif',
					backgroundColor: '#140F17',
					color: '#F5F5F5',
					height: '100%',
					minHeight: '100%',
				},
				p: {
					margin: '0',
				},
			},
		},
		MuiTypography: {
			styleOverrides: {
				root: {
					letterSpacing: '0',
				},
			},
		},
		MuiLink: {
			styleOverrides: {
				root: {
					color: '#BDBDBD',
					textDecoration: 'none',
					'&:hover': {
						color: '#8E1428',
					},
				},
			},
		},
		MuiDivider: {
			styleOverrides: {
				root: {
					borderColor: 'rgba(115, 12, 30, 0.25)',
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					minWidth: 'auto',
					lineHeight: '1.2',
					boxShadow: 'none',
					textTransform: 'none',
					fontWeight: 600,
				},
				containedPrimary: {
					background: 'linear-gradient(135deg, #730C1E 0%, #480415 100%)',
					'&:hover': {
						background: 'linear-gradient(135deg, #8E1428 0%, #730C1E 100%)',
						boxShadow: 'none',
					},
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					height: '48px',
					width: '100%',
					backgroundColor: '#241414',
					borderRadius: '12px',
					'& fieldset': {
						borderColor: 'rgba(115, 12, 30, 0.35)',
					},
					'&:hover fieldset': {
						borderColor: 'rgba(115, 12, 30, 0.5)',
					},
					'&.Mui-focused fieldset': {
						borderColor: '#730C1E',
						boxShadow: '0 0 0 3px rgba(115, 12, 30, 0.18)',
					},
				},
				input: {
					color: '#F5F5F5',
					'&::placeholder': {
						color: '#8A8A8A',
						opacity: 1,
					},
				},
			},
		},
		MuiInputLabel: {
			styleOverrides: {
				root: {
					color: '#BDBDBD',
					'&.Mui-focused': {
						color: '#730C1E',
					},
				},
			},
		},
		MuiFormHelperText: {
			styleOverrides: {
				root: {
					margin: '5px 0 0 2px',
					lineHeight: '1.2',
					color: '#BDBDBD',
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: 'none',
					backgroundColor: '#241414',
				},
			},
		},
		MuiCheckbox: {
			styleOverrides: {
				root: {
					color: '#8A8A8A',
					'&.Mui-checked': {
						color: '#730C1E',
					},
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					border: '1px solid rgba(115, 12, 30, 0.35)',
					color: '#F5F5F5',
					backgroundColor: '#2C1818',
				},
			},
		},
		MuiIconButton: {
			styleOverrides: {
				root: {
					color: '#BDBDBD',
				},
			},
		},
		MuiContainer: {
			styleOverrides: {
				root: {
					maxWidth: 'inherit',
					padding: '0',
					'@media (min-width: 600px)': {
						paddingLeft: 0,
						paddingRight: 0,
					},
				},
			},
		},
	},
	shadow,
	typography,
};
