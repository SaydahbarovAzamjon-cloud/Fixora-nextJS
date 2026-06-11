import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery } from '@apollo/client';
import { Stack, Pagination } from '@mui/material';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import SearchBar from '../../libs/components/search/SearchBar';
import SearchFilters from '../../libs/components/search/SearchFilters';
import TechnicianResultCard from '../../libs/components/search/TechnicianResultCard';
import { GET_TECHNICIANS } from '../../apollo/user/query';
import { TechnicianSummary, TechniciansInquiry } from '../../libs/types/fixora/fixora';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const DEFAULT_INPUT: TechniciansInquiry = {
	page: 1,
	limit: 10,
	sort: 'averageRating',
	direction: 'DESC',
	search: {},
};

const SearchPage: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<TechniciansInquiry>(DEFAULT_INPUT);
	const [technicians, setTechnicians] = useState<TechnicianSummary[]>([]);
	const [total, setTotal] = useState<number>(0);

	const { data, refetch } = useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTechnicians(data?.getTechnicians?.list ?? []);
			setTotal(data?.getTechnicians?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (router.query.input) {
			setSearchFilter(JSON.parse(router.query.input as string));
		}
	}, [router]);

	useEffect(() => {
		router.replace(`/search?input=${JSON.stringify(searchFilter)}`, undefined, { shallow: true });
		refetch({ input: searchFilter });
	}, [searchFilter]);

	const paginationChangeHandler = (_: ChangeEvent<unknown>, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	return (
		<Stack className="fixora-search-page">
			<Stack className="container">
				<SearchBar searchFilter={searchFilter} setSearchFilter={setSearchFilter} />

				<Stack className="fixora-search__layout">
					<SearchFilters searchFilter={searchFilter} setSearchFilter={setSearchFilter} />

					<Stack className="fixora-search__results">
						{technicians.length === 0 ? (
							<div className="fixora-search__no-results">{t('search.results.noResults')}</div>
						) : (
							technicians.map((technician) => <TechnicianResultCard key={technician._id} technician={technician} />)
						)}

						{technicians.length !== 0 && Math.ceil(total / searchFilter.limit) > 1 && (
							<Stack className="fixora-search__pagination">
								<Pagination
									page={searchFilter.page}
									count={Math.ceil(total / searchFilter.limit)}
									onChange={paginationChangeHandler}
									shape="circular"
									color="primary"
								/>
							</Stack>
						)}
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withLayoutFull(SearchPage);
