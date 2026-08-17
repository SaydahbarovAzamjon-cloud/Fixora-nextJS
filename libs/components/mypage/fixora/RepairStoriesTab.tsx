import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import Moment from 'react-moment';
import { GET_MY_ARTICLES } from '../../../../apollo/user/profile';
import { Article } from '../../../types/fixora/fixora';
import { resolveArticleImageUrl } from '../../../utils/articleImage';

const RepairStoriesTab = () => {
	const { t } = useTranslation('common');
	const router = useRouter();

	const { data } = useQuery(GET_MY_ARTICLES, {
		variables: { input: { page: 1, limit: 50, search: {} } },
		fetchPolicy: 'network-only',
	});

	const articles: Article[] = data?.getMyArticles?.list ?? [];

	if (!articles.length) {
		return <p className="fixora-mypage__empty">{t('mypage.noStories')}</p>;
	}

	return (
		<div className="fixora-mypage__stories">
			{articles.map((article) => {
				const coverUrl = resolveArticleImageUrl(article.articleImage);
				return (
					<button
						key={article._id}
						type="button"
						className="fixora-mypage__story"
						onClick={() => router.push(`/community/${article._id}`)}
					>
						{coverUrl && <img className="fixora-mypage__story-image" src={coverUrl} alt="" />}
						<div className="fixora-mypage__story-info">
							<strong>{article.articleTitle}</strong>
							{article.articleExcerpt && <p>{article.articleExcerpt}</p>}
							<Moment format="MMM D, YYYY" className="fixora-mypage__story-date">
								{article.createdAt}
							</Moment>
						</div>
					</button>
				);
			})}
		</div>
	);
};

export default RepairStoriesTab;
