import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import withAdminLayout from '../../../libs/components/layout/AdminLayout';
import { adminPageProps } from '../../../libs/i18n/adminPageProps';
import AdminHeader from '../../../libs/components/admin/AdminHeader';
import AdminUserDetailHeader from '../../../libs/components/admin/users/AdminUserDetailHeader';
import AdminUserSectionNav, {
	type AdminUserSectionId,
	ADMIN_USER_SECTIONS,
} from '../../../libs/components/admin/users/AdminUserSectionNav';
import AdminUserOverview from '../../../libs/components/admin/users/sections/AdminUserOverview';
import AdminUserPerformance from '../../../libs/components/admin/users/sections/AdminUserPerformance';
import AdminUserFinancial from '../../../libs/components/admin/users/sections/AdminUserFinancial';
import AdminUserContent from '../../../libs/components/admin/users/sections/AdminUserContent';
import AdminUserVerification from '../../../libs/components/admin/users/sections/AdminUserVerification';
import AdminUserModeration from '../../../libs/components/admin/users/sections/AdminUserModeration';
import AdminUserActivity from '../../../libs/components/admin/users/sections/AdminUserActivity';
import { useAdminUserDetail } from '../../../libs/hooks/useAdminUserDetail';
import { displayUserName } from '../../../libs/hooks/useUserLookup';

const AdminUserDetailPage: NextPage = () => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const userId = typeof router.query.id === 'string' ? router.query.id : undefined;
	const [activeSection, setActiveSection] = useState<AdminUserSectionId>('overview');

	const {
		user,
		loading,
		bookingStats,
		successRate,
		payments,
		articles,
		stories,
		techReviews,
		clientProfile,
		analytics,
		commentsByUser,
		reportsReceived,
		loginHistory,
		moderationHistory,
		verificationTimeline,
		sectionsLoading,
		refetchAll,
	} = useAdminUserDetail(userId);

	useEffect(() => {
		if (!router.isReady) return;
		const hash = router.asPath.split('#')[1] as AdminUserSectionId | undefined;
		if (hash && ADMIN_USER_SECTIONS.includes(hash)) {
			setActiveSection(hash);
		}
	}, [router.isReady, router.asPath]);

	const scrollToSection = (id: AdminUserSectionId) => {
		setActiveSection(id);
		const el = document.getElementById(id);
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	const title = user ? displayUserName(user) : t('userDetail.title');

	return (
		<>
			<AdminHeader title={title} subtitle={t('userDetail.subtitle')} />
			<div className="fixora-admin-page">
				{loading && !user && <p className="fixora-admin-muted">{t('common.loading')}</p>}
				{!loading && !user && (
					<p className="fixora-admin-muted">{t('userDetail.notFound')}</p>
				)}
				{user && (
					<div className="fixora-admin-user-detail">
						<AdminUserDetailHeader user={user} onUpdated={refetchAll} />
						<AdminUserSectionNav active={activeSection} onSelect={scrollToSection} />
						<div className="fixora-admin-user-detail__sections">
							<AdminUserOverview user={user} />
							<AdminUserPerformance
								user={user}
								bookingStats={bookingStats}
								successRate={successRate}
								analytics={analytics}
								clientProfile={clientProfile}
								techReviews={techReviews}
								loading={sectionsLoading.bookings}
							/>
							<AdminUserFinancial payments={payments} loading={sectionsLoading.payments} />
							<AdminUserContent
								articles={articles}
								stories={stories}
								commentsByUser={commentsByUser}
								reportsReceived={reportsReceived}
								userLikes={user.userLikes}
								userArticles={user.userArticles}
								loading={sectionsLoading.articles || sectionsLoading.stories}
							/>
							<AdminUserVerification
								user={user}
								verificationTimeline={verificationTimeline}
								onUpdated={refetchAll}
							/>
							<AdminUserModeration user={user} moderationHistory={moderationHistory} />
							<AdminUserActivity user={user} loginHistory={loginHistory} />
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export const getServerSideProps = adminPageProps;

export default withAdminLayout(AdminUserDetailPage, { title: 'User Detail' });
