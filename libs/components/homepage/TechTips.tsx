import React, { useState } from 'react';
import Link from 'next/link';
import { Stack, Box } from '@mui/material';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import EastIcon from '@mui/icons-material/East';
import { GET_ARTICLES } from '../../../apollo/user/query';
import { ArticleSummary, ArticlesInquiry } from '../../types/fixora/fixora';
import TechTipCard from './TechTipCard';
import { T } from '../../types/common';

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
	const [articles, setArticles] = useState<ArticleSummary[]>([]);

	useQuery(GET_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setArticles(data?.getArticles?.list ?? []);
		},
	});

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
						<TechTipCard article={article} key={article._id} linkable />
					))}
				</Box>
			</Stack>
		</Stack>
	);
};

export default TechTips;
