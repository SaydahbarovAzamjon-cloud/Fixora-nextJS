import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { FixoraButton } from '../../libs/components/ui';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const TechnicianLanding: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);

	useEffect(() => {
		if (user?._id && user?.memberType === 'TECHNICIAN') {
			router.replace('/technician/dashboard').then();
		}
	}, [user, router]);

	return (
		<div className="fixora-technician-landing">
			<div className="fixora-technician-landing__container">
				<div className="fixora-technician-landing__content">
					<h1 className="fixora-technician-landing__title">
						Join <span className="fixora-technician-landing__accent">Fixora</span> Technicians
					</h1>
					<p className="fixora-technician-landing__subtitle">
						Grow your repair business with Fixora's AI-powered marketplace
					</p>

					<div className="fixora-technician-landing__features">
						<div className="fixora-technician-landing__feature">
							<div className="fixora-technician-landing__feature-icon">📱</div>
							<h3>Easy Booking Management</h3>
							<p>Manage all your repairs in one place</p>
						</div>

						<div className="fixora-technician-landing__feature">
							<div className="fixora-technician-landing__feature-icon">⭐</div>
							<h3>Build Your Reputation</h3>
							<p>Get rated and trusted by customers</p>
						</div>

						<div className="fixora-technician-landing__feature">
							<div className="fixora-technician-landing__feature-icon">💰</div>
							<h3>Earn More</h3>
							<p>Grow your income without overhead</p>
						</div>

						<div className="fixora-technician-landing__feature">
							<div className="fixora-technician-landing__feature-icon">🛡️</div>
							<h3>Secure & Safe</h3>
							<p>Protected payments and verified customers</p>
						</div>
					</div>

					<div className="fixora-technician-landing__actions">
						<FixoraButton
							variant="primary"
							size="large"
							onClick={() => router.push('/login?referrer=/technician/dashboard')}
						>
							Log In as Technician
						</FixoraButton>
						<FixoraButton
							variant="secondary"
							size="large"
							onClick={() => router.push('/register/technician/1')}
						>
							Become a Technician
						</FixoraButton>
					</div>
				</div>
			</div>
		</div>
	);
};

export default withLayoutFull(TechnicianLanding);
