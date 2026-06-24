import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import CommunityCard from '../common/CommunityCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { Article } from '../../types/fixora/fixora';
import { LIKE_TARGET_ARTICLE } from '../../../apollo/user/article';
import { GET_ARTICLES } from '../../../apollo/user/query';
import { Messages } from '../../config';
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert } from '../../sweetAlert';

const MyArticles: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [searchCommunity, setSearchCommunity] = useState({
		...initialInput,
		search: { userId: user._id },
	});
	const [boardArticles, setBoardArticles] = useState<Article[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);

	/** APOLLO REQUESTS **/
const [likeTargetArticle] = useMutation(LIKE_TARGET_ARTICLE);

const {
  loading: boardArticlesLoading,
  data: boardArticlesData,
  error: getArticlesError,
  refetch: boardArticlesRefetch,
} = useQuery(GET_ARTICLES, {
  fetchPolicy: 'network-only',
  variables: {
    input: searchCommunity,
  },
  notifyOnNetworkStatusChange: true,
  onCompleted: (data: T) => {
    setBoardArticles(data?.getArticles?.list);
    setTotalCount(data?.getArticles?.metaCounter[0]?.total);
  },
});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const likeBoArticleHandler = async (e: any, user: any, id: string) => {
  try {
    e.stopPropagation();
    if (!id) return;
    if (!user?._id) throw new Error(Messages.error2);

    await likeTargetArticle({
      variables: {
        input: id,
      },
    });

    await boardArticlesRefetch({ input: searchCommunity });
    await sweetTopSmallSuccessAlert('Success!', 750);
  } catch (err: any) {
    console.log('ERROR, likeBoArticleHandler:', err.message);
    sweetMixinErrorAlert(err.message).then();
  }
};

	if (device === 'mobile') {
		return <>ARTICLE PAGE MOBILE</>;
	} else
		return (
			<div id="my-articles-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Article</Typography>
						<Typography className="sub-title">We are glad to see you again!</Typography>
					</Stack>
				</Stack>
				<Stack className="article-list-box">
					{boardArticles?.length > 0 ? (
						boardArticles?.map((boardArticle: Article) => {
							return(
              <CommunityCard 
								boardArticle={boardArticle} 
								key={boardArticle?._id} 
								size={'small'} 
								likeArticleHandler={undefined} />
							) 
						})
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No Articles found!</p>
						</div>
					)}
				</Stack>

				{boardArticles?.length > 0 && (
					<Stack className="pagination-conf">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(totalCount / searchCommunity.limit)}
								page={searchCommunity.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total">
							<Typography>Total {totalCount ?? 0} article(s) available</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
};

MyArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MyArticles;
