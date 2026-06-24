import shadow from './shadow';
import typography from './typography';

/**
 * Technician portal — preserves original orange MUI theme (excluded from burgundy migration).
 */
export const fixoraTechnicianOrange = {
	palette: {
		mode: 'dark' as const,
		primary: {
			main: '#FF6B00',
			light: '#FF8533',
			dark: '#E55A00',
			contrastText: '#FFFFFF',
		},
		secondary: {
			main: '#A0A0A0',
			contrastText: '#FFFFFF',
		},
		background: {
			default: '#0D0D0D',
			paper: '#1A1A1A',
		},
		text: {
			primary: '#FFFFFF',
			secondary: '#A0A0A0',
			disabled: '#6B6B6B',
		},
		error: {
			main: '#FF4D4F',
		},
		success: {
			main: '#52C41A',
		},
		divider: 'rgba(255, 107, 0, 0.2)',
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				html: {
					height: '100%',
				},
				body: {
					fontFamily: '"Plus Jakarta Sans", "Manrope", "Inter", sans-serif',
					backgroundColor: '#0D0D0D',
					color: '#FFFFFF',
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
					color: '#A0A0A0',
					textDecoration: 'none',
					'&:hover': {
						color: '#FF8533',
					},
				},
			},
		},
		MuiDivider: {
			styleOverrides: {
				root: {
					borderColor: 'rgba(255, 107, 0, 0.2)',
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
					background: 'linear-gradient(135deg, #FF6B00 0%, #E55A00 100%)',
					'&:hover': {
						background: 'linear-gradient(135deg, #FF8533 0%, #FF6B00 100%)',
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
					backgroundColor: '#1A1A1A',
					borderRadius: '12px',
					'& fieldset': {
						borderColor: 'rgba(255, 107, 0, 0.3)',
					},
					'&:hover fieldset': {
						borderColor: 'rgba(255, 107, 0, 0.45)',
					},
					'&.Mui-focused fieldset': {
						borderColor: '#FF6B00',
						boxShadow: '0 0 0 3px rgba(255, 107, 0, 0.15)',
					},
				},
				input: {
					color: '#FFFFFF',
					'&::placeholder': {
						color: '#6B6B6B',
						opacity: 1,
					},
				},
			},
		},
		MuiInputLabel: {
			styleOverrides: {
				root: {
					color: '#A0A0A0',
					'&.Mui-focused': {
						color: '#FF6B00',
					},
				},
			},
		},
		MuiFormHelperText: {
			styleOverrides: {
				root: {
					margin: '5px 0 0 2px',
					lineHeight: '1.2',
					color: '#A0A0A0',
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: 'none',
					backgroundColor: '#1A1A1A',
				},
			},
		},
		MuiCheckbox: {
			styleOverrides: {
				root: {
					color: '#6B6B6B',
					'&.Mui-checked': {
						color: '#FF6B00',
					},
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					border: '1px solid rgba(255, 107, 0, 0.35)',
					color: '#FFFFFF',
					backgroundColor: '#242424',
				},
			},
		},
		MuiIconButton: {
			styleOverrides: {
				root: {
					color: '#A0A0A0',
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
