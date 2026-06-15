import React, { useMemo } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery, useReactiveVar } from '@apollo/client';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import TechnicianProfileForm from '../../../libs/components/technician/TechnicianProfileForm';
import { GET_USER } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const PublicProfile: NextPage = () => {
	const user = useReactiveVar(userVar);

	const { data: userData, loading } = useQuery(GET_USER, {
		skip: !user?._id,
		variables: { userId: user?._id },
		fetchPolicy: 'network-only',
	});

	const currentUser = useMemo(() => userData?.getUser ?? null, [userData]);

	const initialProfileData = currentUser ? {
		fullName: currentUser.userFullName || '',
		nickname: currentUser.userNickname || '',
		bio: currentUser.userBio || '',
		location: currentUser.userLocation || '',
		profileImage: currentUser.userProfileImage || '',
		rating: currentUser.averageRating || 0,
		jobsCompleted: currentUser.completedJobsCount || 0,
		experience: currentUser.yearsExperience || '',
	} : undefined;

	if (loading && !initialProfileData) {
		return (
			<div className="fixora-technician-profile-page">
				<div style={{ padding: '2rem', textAlign: 'center' }}>
					Loading your profile...
				</div>
			</div>
		);
	}

	return (
		<div className="fixora-technician-profile-page">
			<TechnicianProfileForm
				initialData={initialProfileData}
				onSave={(data) => {
					console.log('Profile updated:', data);
				}}
			/>
		</div>
	);
};

export default withTechnicianLayout(PublicProfile);
