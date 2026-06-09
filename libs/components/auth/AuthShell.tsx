import React, { ReactNode } from 'react';
import { useTranslation } from 'next-i18next';
import { FixoraGlassCard } from '../ui';

interface AuthShellProps {
	children: ReactNode;
	showBrand?: boolean;
}

const AuthShell = ({ children, showBrand = true }: AuthShellProps) => {
	const { t } = useTranslation('auth');

	return (
		<>
			{showBrand && (
				<div className="auth-brand">
					<div className="auth-brand__logo">
						<img src="/img/logo/logoText.png" alt="Fixora" />
						<span>FIXORA</span>
					</div>
					<p className="auth-brand__tagline">{t('brand.tagline')}</p>
				</div>
			)}
			<div className="auth-card">
				<FixoraGlassCard>{children}</FixoraGlassCard>
			</div>
		</>
	);
};

export default AuthShell;
