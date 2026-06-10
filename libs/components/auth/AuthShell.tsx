import React, { ReactNode } from 'react';
import { useTranslation } from 'next-i18next';
import { FixoraGlassCard } from '../ui';
import { FixoraLogo } from '../brand';

interface AuthShellProps {
	children: ReactNode;
	showBrand?: boolean;
}

const AuthShell = ({ children, showBrand = true }: AuthShellProps) => {
	const { t } = useTranslation('auth');

	return (
		<>
			{showBrand && (
				<FixoraLogo
					className="auth-brand"
					size="lg"
					showTagline
					tagline={t('brand.tagline')}
				/>
			)}
			<div className="auth-card">
				<FixoraGlassCard>{children}</FixoraGlassCard>
			</div>
		</>
	);
};

export default AuthShell;
