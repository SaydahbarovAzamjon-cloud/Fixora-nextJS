import React, { useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { CHANGE_PASSWORD } from '../../../../apollo/user/settings';
import SecuritySettingsSection from '../../technician/settings/sections/SecuritySettingsSection';
import { sweetErrorHandling } from '../../../sweetAlert';

const ClientSecurityPanel: React.FC = () => {
	const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD);

	const onSavePassword = useCallback(
		async (currentPassword: string, newPassword: string) => {
			try {
				await changePassword({
					variables: { input: { currentPassword, newPassword } },
				});
				return true;
			} catch (err) {
				await sweetErrorHandling(err);
				return false;
			}
		},
		[changePassword],
	);

	return <SecuritySettingsSection onSavePassword={onSavePassword} saving={loading} />;
};

export default ClientSecurityPanel;
