import React, { useState } from 'react';
import Link from 'next/link';
import { Stack, Box } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import EastIcon from '@mui/icons-material/East';
import { GET_ARTICLES } from '../../../apollo/user/query';
import { LIKE_TARGET_ARTICLE } from '../../../apollo/user/article';
import { userVar } from '../../../apollo/store';
import { ArticleSummary, ArticlesInquiry } from '../../types/fixora/fixora';
import TechTipCard from './TechTipCard';
import { T } from '../../types/common';
import { sweetErrorHandling } from '../../sweetAlert';

interface TechTipsProps {
	initialInput?: ArticlesInquiry;
}

const DEFAULT_INPUT: ArticlesInquiry = {
	page: 1,
	limit: 3,
	sort: 'articleViews',
	direction: 'DESC',
	search: {},
};

const TechTips = ({ initialInput = DEFAULT_INPUT }: TechTipsProps) => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [articles, setArticles] = useState<ArticleSummary[]>([]);
	const [likePendingId, setLikePendingId] = useState<string | null>(null);

	useQuery(GET_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setArticles(data?.getArticles?.list ?? []);
		},
	});

	const [likeArticle] = useMutation(LIKE_TARGET_ARTICLE);

	const handleLike = async (articleId: string) => {
		if (!user?._id) {
			await sweetErrorHandling(new Error(t('community.loginToLike')));
			return;
		}

		setLikePendingId(articleId);
		try {
			const result = await likeArticle({
				variables: { input: articleId },
			});
			const updated = result.data?.likeTargetArticle;
			if (updated) {
				setArticles((prev) =>
					prev.map((item) =>
						item._id === articleId
							? {
									...item,
									articleLikes: updated.articleLikes,
									meLiked: updated.meLiked,
								}
							: item,
					),
				);
			}
		} catch (err: unknown) {
			await sweetErrorHandling(err);
		} finally {
			setLikePendingId(null);
		}
	};

	if (articles.length === 0) return null;

	return (
		<Stack className="fixora-home-section fixora-home-tips">
			<Stack className="container">
				<Box component="div" className="fixora-home-section__head">
					<h2>{t('homepage.tips.title')}</h2>
					<Link href="/community" className="fixora-home-section__view-all">
						{t('homepage.viewAll')} <EastIcon fontSize="inherit" />
					</Link>
				</Box>
				<Box component="div" className="fixora-home-tips__grid">
					{articles.map((article) => (
						<TechTipCard
							article={article}
							key={article._id}
							linkable
							onLike={handleLike}
							likePending={likePendingId === article._id}
						/>
					))}
				</Box>
			</Stack>
		</Stack>
	);
};

export default TechTips;
