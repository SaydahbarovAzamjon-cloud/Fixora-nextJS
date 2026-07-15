import React, { ReactNode } from 'react';
import Link from 'next/link';
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
				<Link href="/" className="auth-brand auth-brand--link" aria-label={t('brand.homeAria')}>
					<FixoraLogo size="lg" />
				</Link>
			)}
			<div className="auth-card">
				<FixoraGlassCard>{children}</FixoraGlassCard>
			</div>
		</>
	);
};

export default AuthShell;
