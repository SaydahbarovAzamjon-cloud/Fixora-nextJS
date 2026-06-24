import shadow from './shadow';
import typography from './typography';

/**
 * FIXORA LIGHT THEME (P4-05) — Apple-inspired premium marketplace palette
 * Design authority: user light-mode prompt (Phase 5)
 */
export const fixoraLight = {
	palette: {
		mode: 'light' as const,
		primary: {
			main: '#C1121F',
			light: '#E11D48',
			dark: '#A20E19',
			contrastText: '#FFFFFF',
		},
		secondary: {
			main: '#6B7280',
			contrastText: '#111827',
		},
		background: {
			default: '#FFFFFF',
			paper: '#FFFFFF',
		},
		text: {
			primary: '#111827',
			secondary: '#6B7280',
			disabled: '#94A3B8',
		},
		error: {
			main: '#FF4D4F',
		},
		success: {
			main: '#52C41A',
		},
		divider: '#F1F5F9',
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				html: {
					height: '100%',
				},
				body: {
					fontFamily: '"Plus Jakarta Sans", "Manrope", "Inter", sans-serif',
					backgroundColor: '#FFFFFF',
					color: '#111827',
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
					color: '#6B7280',
					textDecoration: 'none',
					'&:hover': {
						color: '#C1121F',
					},
				},
			},
		},
		MuiDivider: {
			styleOverrides: {
				root: {
					borderColor: '#F1F5F9',
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					minWidth: 'auto',
					lineHeight: '1.2',
					textTransform: 'none',
					fontWeight: 600,
					transition: 'all 0.25s ease',
				},
				containedPrimary: {
					background: 'linear-gradient(135deg, #C1121F 0%, #E11D48 100%)',
					color: '#FFFFFF',
					boxShadow: '0 8px 24px rgba(193, 18, 31, 0.20)',
					'&:hover': {
						background: 'linear-gradient(135deg, #A20E19 0%, #C1121F 100%)',
						boxShadow: '0 8px 24px rgba(193, 18, 31, 0.28)',
					},
				},
				outlined: {
					background: '#FFFFFF',
					borderColor: '#E5E7EB',
					color: '#111827',
					'&:hover': {
						borderColor: '#C1121F',
						background: '#FFF1F2',
					},
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					height: '48px',
					width: '100%',
					backgroundColor: '#FFFFFF',
					borderRadius: '12px',
					boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
					'& fieldset': {
						borderColor: '#E5E7EB',
					},
					'&:hover fieldset': {
						borderColor: '#D1D5DB',
					},
					'&.Mui-focused fieldset': {
						borderColor: '#C1121F',
						borderWidth: '2px',
						boxShadow: '0 0 0 2px rgba(193, 18, 31, 0.25)',
					},
				},
				input: {
					color: '#111827',
					'&::placeholder': {
						color: '#94A3B8',
						opacity: 1,
					},
				},
			},
		},
		MuiInputLabel: {
			styleOverrides: {
				root: {
					color: '#6B7280',
					'&.Mui-focused': {
						color: '#C1121F',
					},
				},
			},
		},
		MuiFormHelperText: {
			styleOverrides: {
				root: {
					margin: '5px 0 0 2px',
					lineHeight: '1.2',
					color: '#6B7280',
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: 'none',
					backgroundColor: '#FFFFFF',
					boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
				},
			},
		},
		MuiCheckbox: {
			styleOverrides: {
				root: {
					color: '#94A3B8',
					'&.Mui-checked': {
						color: '#C1121F',
					},
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					border: '1px solid rgba(190, 24, 93, 0.08)',
					color: '#111827',
					backgroundColor: '#FFFFFF',
				},
			},
		},
		MuiIconButton: {
			styleOverrides: {
				root: {
					color: '#6B7280',
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
