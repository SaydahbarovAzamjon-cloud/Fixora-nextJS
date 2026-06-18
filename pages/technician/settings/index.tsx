import { NextPage } from 'next';
import { technicianPageProps } from '../../../libs/i18n/technicianPageProps';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import SettingsPage from '../../../libs/components/technician/settings/SettingsPage';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: await technicianPageProps(locale),
});

const Settings: NextPage = () => <SettingsPage />;

export default withTechnicianLayout(Settings);
