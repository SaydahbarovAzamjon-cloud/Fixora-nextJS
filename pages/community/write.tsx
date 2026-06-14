import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import ArticleEditor from '../../libs/components/community/fixora/ArticleEditor';
import { userVar } from '../../apollo/store';

const WritePage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	useEffect(() => {
		if (!user?._id) {
			router.push('/login');
		}
	}, [user, router]);

	if (!user?._id) {
		return null;
	}

	return (
		<div className="fixora-write-page">
			<div className="fixora-write-container">
				<h1 className="fixora-write-page__title">Create Article</h1>
				<ArticleEditor />
			</div>
		</div>
	);
};

export default withLayoutFull(WritePage);
