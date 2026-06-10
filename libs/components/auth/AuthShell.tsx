import React, { ReactNode } from 'react';
import { FixoraGlassCard } from '../ui';
import { FixoraLogo } from '../brand';

interface AuthShellProps {
	children: ReactNode;
	showBrand?: boolean;
}

const AuthShell = ({ children, showBrand = true }: AuthShellProps) => {
	return (
		<>
			{showBrand && <FixoraLogo className="auth-brand" size="lg" />}
			<div className="auth-card">
				<FixoraGlassCard>{children}</FixoraGlassCard>
			</div>
		</>
	);
};

export default AuthShell;
