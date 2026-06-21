import { GetServerSideProps } from 'next';
import { parseOwnerMyPageTab, ownerMyPageHref } from '../../libs/utils/clientMyPageRoute';

const LEGACY_TAB_MAP: Record<string, string> = {
	requests: 'activeRequests',
	stories: 'repairHistory',
};

const MyPageRedirect = () => null;

export const getServerSideProps: GetServerSideProps = async (context) => {
	const tabParam = context.query.tab;
	const tabValue = Array.isArray(tabParam) ? tabParam[0] : tabParam;
	const mapped = tabValue && LEGACY_TAB_MAP[tabValue] ? LEGACY_TAB_MAP[tabValue] : tabValue;
	const tab = parseOwnerMyPageTab(mapped);
	const section = context.query.section;
	const sectionValue = Array.isArray(section) ? section[0] : section;

	return {
		redirect: {
			destination: ownerMyPageHref(tab, typeof sectionValue === 'string' ? sectionValue : undefined),
			permanent: false,
		},
	};
};

export default MyPageRedirect;
